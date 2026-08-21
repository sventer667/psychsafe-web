import crypto from 'node:crypto'
import forgeImport from 'node-forge'
import type { asn1 as Asn1Ns } from 'node-forge'
import { db } from './db.js'

// @types/node-forge doesn't cover the tsp (RFC 3161 Time-Stamp Protocol) or
// oids submodules, even though both exist at runtime in node-forge itself.
type Asn1 = Asn1Ns.Asn1
const forge = forgeImport as typeof forgeImport & {
  tsp: {
    createTimeStampRequest(options: {
      version: number
      messageImprint: { hashAlgorithm: string; hashedMessage: string }
      certReq: boolean
    }): Asn1
    messageFromAsn1(obj: Asn1): { status?: { status?: number } }
  }
  oids: Record<string, string>
}

export interface SealResult {
  hash: string
  algorithm: string
  timestampToken: string | null
  timestampAuthority: string | null
  timestampTime: string | null
}

/**
 * Builds a canonical (stable, sorted-key) JSON representation of every record
 * belonging to a case, so the same data always hashes to the same digest.
 */
function canonicalCaseData(caseId: number) {
  const caseRow = db.prepare('SELECT * FROM cases WHERE id = ?').get(caseId) as Record<string, unknown>
  const hazards = db.prepare('SELECT * FROM hazards WHERE caseId = ? ORDER BY id').all(caseId)
  const actionItems = db.prepare('SELECT * FROM action_items WHERE caseId = ? ORDER BY id').all(caseId)
  const consultations = db.prepare('SELECT * FROM consultations WHERE caseId = ? ORDER BY id').all(caseId)

  // Exclude seal fields themselves and volatile fields from the hashed payload.
  const { sealHash, sealAlgorithm, sealTimestampToken, sealTimestampAuthority, sealTimestampTime, ...caseForHash } =
    caseRow

  return sortKeysDeep({ case: caseForHash, hazards, actionItems, consultations })
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortKeysDeep((value as Record<string, unknown>)[key])
    }
    return out
  }
  return value
}

/**
 * Requests an RFC 3161 timestamp token from a public Time-Stamp Authority for
 * the given SHA-256 digest (as a byte string). Returns null if the TSA is
 * unreachable or rejects the request. Sealing still proceeds with the local
 * hash + server time in that case, it just won't carry third-party attestation.
 */
async function requestTimestamp(hashBytes: string): Promise<{ token: string; authority: string } | null> {
  const TSA_URL = process.env.TSA_URL || 'http://timestamp.digicert.com'

  try {
    const tspReq = forge.tsp.createTimeStampRequest({
      version: 1,
      messageImprint: {
        hashAlgorithm: forge.oids.sha256,
        hashedMessage: hashBytes,
      },
      certReq: true,
    })

    const requestDer = forge.asn1.toDer(tspReq).getBytes()
    const requestBuffer = Buffer.from(requestDer, 'binary')

    const res = await fetch(TSA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/timestamp-query',
        'Content-Length': String(requestBuffer.length),
      },
      body: requestBuffer,
    })

    if (!res.ok) return null

    const responseBuffer = Buffer.from(await res.arrayBuffer())
    const responseAsn1 = forge.asn1.fromDer(forge.util.createBuffer(responseBuffer.toString('binary')))
    const tspResp = forge.tsp.messageFromAsn1(responseAsn1)
    const status = tspResp.status?.status
    if (status !== 0 && status !== 1) return null // 0 = granted, 1 = granted with mods

    return {
      token: Buffer.from(responseBuffer).toString('base64'),
      authority: new URL(TSA_URL).hostname,
    }
  } catch (err) {
    console.warn('RFC 3161 timestamp request failed, sealing with local hash only:', (err as Error).message)
    return null
  }
}

export async function sealCase(caseId: number): Promise<SealResult> {
  const canonical = canonicalCaseData(caseId)
  const payload = JSON.stringify(canonical)

  const hash = crypto.createHash('sha256').update(payload, 'utf8').digest()
  const hashHex = hash.toString('hex')
  const hashBytes = hash.toString('binary')

  const ts = await requestTimestamp(hashBytes)

  return {
    hash: hashHex,
    algorithm: 'SHA-256',
    timestampToken: ts?.token ?? null,
    timestampAuthority: ts?.authority ?? 'local (RFC 3161 authority unreachable)',
    timestampTime: new Date().toISOString(),
  }
}
