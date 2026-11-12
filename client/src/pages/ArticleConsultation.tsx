import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import logo from '../assets/humanora-logo.png'

// Public article: how to record worker consultation on psychosocial hazards. Brand-only, no byline.
// Sets its own page title, description, canonical link and Article structured data while
// mounted (the app is a single-page app, so there is no per-route <head> to edit).

const TITLE = 'Recording Consultation on Psychosocial Hazards | Humanora'
const DESCRIPTION =
  'What worker consultation on psychosocial hazards has to involve, and how to record it so you can show who was asked, what they said and what you did about it.'
const PATH = '/articles/recording-worker-consultation-psychosocial-hazards'

const GAP_CHECK = '/gap-check?utm_source=article&utm_medium=seo&utm_campaign=articles&utm_content=consultation'

export function ArticleConsultation() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const prevTitle = document.title
    document.title = TITLE

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    const createdMeta = !meta
    const prevDesc = meta?.getAttribute('content') ?? null
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', DESCRIPTION)

    const canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    canonical.setAttribute('href', `https://humanora.com.au${PATH}`)
    document.head.appendChild(canonical)

    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'How to record worker consultation on psychosocial hazards',
      description: DESCRIPTION,
      dateModified: '2026-11-12',
      mainEntityOfPage: `https://humanora.com.au${PATH}`,
      author: { '@type': 'Organization', name: 'Humanora' },
      publisher: { '@type': 'Organization', name: 'Humanora' },
    })
    document.head.appendChild(ld)

    return () => {
      document.title = prevTitle
      if (createdMeta) meta?.remove()
      else if (prevDesc !== null) meta?.setAttribute('content', prevDesc)
      canonical.remove()
      ld.remove()
    }
  }, [])

  return (
    <div className="bg-canvas">
      <header className="sticky top-0 z-10 bg-navy">
        <div className="h-[3px] bg-gradient-to-r from-accent via-accent to-navy" />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src={logo} alt="Humanora" className="h-8 w-8 object-contain" />
            <div className="font-serif text-lg font-semibold text-navy-contrast">Humanora</div>
          </button>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate('/dashboard')}>Go to dashboard</Button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-sm font-medium text-navy-contrast/80 hover:text-navy-contrast">
                  Log in
                </button>
                <Button onClick={() => navigate('/signup')}>Start free trial</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} /> Back to Humanora
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Users size={24} />
          </div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">How to record worker consultation on psychosocial hazards</h1>
        </div>

        <p className="mt-4 text-sm italic text-muted">
          Last reviewed 12 November 2026. General information only, not legal advice.
        </p>

        <Card className="mt-6 border-accent/30 bg-accent/5">
          <p className="text-sm text-muted">
            <strong className="text-ink">Rules differ by jurisdiction.</strong> Each state and territory has its own WHS regulator, and each regulator publishes its own codes of practice and regulations. Most are based on the Safe Work Australia model code, but they are not identical, and Victoria and Western Australia run their own frameworks. This article uses the model code as a common reference. Always check the code and regulations that apply where you operate. Our{' '}
            <Link to="/guides" className="text-accent hover:underline">state and territory guides</Link> link to each regulator’s material.
          </p>
        </Card>

        <p className="mt-6 text-lg text-muted">
          Most workplaces consult their workers on psychosocial hazards. The trouble starts when someone asks you to prove it. A chat at the Monday meeting, a survey that went out in the spring, a conversation with a supervisor in the corridor. All of it happened, and almost none of it is written down in a way you could hand over. This article covers what the codes expect from consultation, and what to record so the work shows.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What the code expects</h2>
        <p className="mt-3 text-muted">
          The Safe Work Australia model code is the common starting point, and most jurisdictions have adopted or adapted it. The wording, numbering and legal force can differ, and some places add their own regulations on top. Read the code your regulator publishes alongside this article.
        </p>
        <p className="mt-3 text-muted">
          Under the model code, you must consult workers who are, or are likely to be, directly affected by a health and safety matter. For psychosocial risk, that includes when you assess risks and when you decide on controls. It also covers when you propose changes that could affect their health or safety.
        </p>
        <p className="mt-3 text-muted">
          “Worker” is broad. It takes in employees, contractors and their staff, labour-hire workers, apprentices, trainees, work experience students and volunteers. Any health and safety representatives must be included in the consultation.
        </p>
        <p className="mt-3 text-muted">
          The code sets out four things consultation must involve. You share relevant information. You give workers a reasonable opportunity to raise issues and give their views. You take those views into account before you decide. And you tell workers the outcome in a timely way.
        </p>
        <p className="mt-3 text-muted">That last one is the step most records leave out.</p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Why a record matters</h2>
        <p className="mt-3 text-muted">
          Codes of practice generally say to keep records of your risk management process, including who you consulted, but check your own regulator’s wording. If you’re asked how you consulted your workers, “we always do” isn’t an answer. A dated record is.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">What to write down each time</h2>
        <p className="mt-3 text-muted">Think of a consultation entry as answering six questions:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li><strong className="text-ink">When and how.</strong> The date and the method: a team meeting, a focus group, a survey, a toolbox talk, individual conversations, a WHS committee meeting. The code lists all of these as examples, and says the form should be agreed with workers.</li>
          <li><strong className="text-ink">Who was invited, and who took part.</strong> Record the groups and numbers, such as “all 14 warehouse staff invited, 11 attended”, along with any health and safety representatives. Pay attention to who is missing, such as night shift, part-timers, remote staff or contractors.</li>
          <li><strong className="text-ink">What you shared.</strong> The information workers needed in order to give a useful view. For example, the hazard you were looking at and the options being considered.</li>
          <li><strong className="text-ink">What they said.</strong> Summarise the views and suggestions raised. You don’t need a transcript, but you do need the substance.</li>
          <li><strong className="text-ink">How it affected the decision.</strong> What you changed, what you didn’t, and why. The code requires you to take views into account, and this is where you show it.</li>
          <li><strong className="text-ink">When and how you told them the outcome.</strong> Date, method and who delivered it.</li>
        </ul>
        <p className="mt-3 text-muted">
          If you do nothing else, record the last two. They turn a list of meetings into evidence that people were heard.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Methods, and what each one leaves behind</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li><strong className="text-ink">Team meetings and toolbox talks.</strong> Quick and familiar, but they leave nothing behind unless someone writes it up. Keep a one-line note in the register as well as in the minutes.</li>
          <li><strong className="text-ink">Focus groups.</strong> Good for depth. Keep a summary and the attendance list.</li>
          <li><strong className="text-ink">Surveys.</strong> Good for large workforces and they produce results you can keep. The code says a survey shouldn’t replace the consultation procedures you’ve agreed with workers, though it can be an extra tool.</li>
          <li><strong className="text-ink">One-to-one conversations.</strong> Useful for sensitive issues. Record the topic and date without identifying the person unless they agree.</li>
          <li><strong className="text-ink">WHS committee meetings.</strong> The minutes are your record. Make sure the psychosocial item appears in them.</li>
        </ul>

        <h2 className="mt-10 font-serif text-2xl text-ink">Sensitive hazards and anonymous input</h2>
        <p className="mt-3 text-muted">
          The code recognises that workers may hold back on issues like bullying or sexual harassment, especially if they worry about their job or career. It suggests considering anonymous surveys or anonymous reporting. A record of anonymous consultation should show the method, the number of responses and the themes, but not names. That protects people and still lets you show the work was done.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">A short worked entry (illustration only)</h2>
        <p className="mt-3 text-muted">
          Picture a regional aged-care facility with about 60 care staff across three shifts, reviewing roster pressure.
        </p>
        <Card className="mt-4">
          <ul className="space-y-1.5 text-sm text-muted">
            <li><strong className="text-ink">Date and method:</strong> 12 May, focus groups (one per shift) and a short anonymous survey</li>
            <li><strong className="text-ink">Invited:</strong> All care staff and the two health and safety representatives</li>
            <li><strong className="text-ink">Took part:</strong> 31 staff across the three focus groups, 38 survey responses, both representatives</li>
            <li><strong className="text-ink">Gap noted:</strong> Few night-shift staff attended, so a second night-shift session was set for 19 May</li>
            <li><strong className="text-ink">Information shared:</strong> Current roster pattern, sick leave and overtime figures, two options for changing shift lengths</li>
            <li><strong className="text-ink">Views raised:</strong> Short breaks between split shifts, last-minute changes to the roster, too few staff on weekends</li>
            <li><strong className="text-ink">Decision:</strong> Roster notice extended to two weeks. Weekend staffing raised with the facility manager. Shift-length change not adopted, because most staff preferred the current pattern</li>
            <li><strong className="text-ink">Outcome shared:</strong> 2 June, team meetings on each shift and a notice on the staff board</li>
          </ul>
        </Card>
        <p className="mt-4 text-muted">
          Anyone reading that entry can tell what was asked, who answered, what changed and how people were told.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-ink">Common gaps</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted">
          <li><strong className="text-ink">One consultation, never repeated.</strong> The code says regular consultation is better than consulting only when a problem arises.</li>
          <li><strong className="text-ink">No record of who was missed.</strong> If one shift or site never takes part, say so and fix it.</li>
          <li><strong className="text-ink">No feedback to workers.</strong> If people never hear what happened, they stop contributing.</li>
          <li><strong className="text-ink">Surveys used as the only method.</strong> They can’t replace the procedures you’ve agreed with workers.</li>
          <li><strong className="text-ink">Names recorded when the input was meant to be anonymous.</strong> Record themes and numbers instead.</li>
        </ul>

        <h2 className="mt-10 font-serif text-2xl text-ink">Keeping it in one place</h2>
        <p className="mt-3 text-muted">
          The test is the same as for the risk register: could someone who wasn’t there read the entry and understand who you consulted, what they said and what you did about it? If yes, you have a record.
        </p>
        <p className="mt-3 text-muted">
          Humanora keeps a consultation log against each assessment, alongside the hazards and actions it relates to. You can also see where your own evidence is thin with our free two-minute Gap Check.
        </p>

        <Card className="mt-8 border-accent/30 bg-accent/5">
          <h3 className="font-serif text-lg text-ink">Check where your evidence is thin</h3>
          <p className="mt-1 text-sm text-muted">
            Our free two-minute Gap Check asks six questions and shows the legislation for your state. No login needed.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => navigate(GAP_CHECK)} className="px-5 py-2.5">
              Run the free Gap Check <ArrowRight size={16} />
            </Button>
          </div>
        </Card>

        <p className="mt-6 text-muted">
          See also:{' '}
          <Link to="/articles/psychosocial-risk-register" className="text-accent hover:underline">What a psychosocial risk register should contain</Link>{' '}
          and our <Link to="/guides" className="text-accent hover:underline">state and territory guides</Link>.
        </p>

        <div className="mt-12 border-t border-border pt-6">
          <h2 className="font-serif text-xl text-ink">Sources</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-muted">
            <li>Safe Work Australia: Model Code of Practice, Managing psychosocial hazards at work (2022), section 1.3 (Consultation) and the risk management process</li>
            <li>SafeWork SA: Managing Psychosocial Hazards at Work, Code of Practice (February 2026)</li>
          </ul>
        </div>
      </article>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-muted">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Humanora" className="h-6 w-6 object-contain" />
            <span>© {new Date().getFullYear()} Humanora</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/legal" className="hover:text-ink">Legal</Link>
            <Link to="/privacy" className="hover:text-ink">Privacy</Link>
            <Link to="/terms" className="hover:text-ink">Terms</Link>
            <Link to="/support" className="hover:text-ink">Support</Link>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="hover:text-ink">Go to dashboard</button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="hover:text-ink">Log in</button>
                <button onClick={() => navigate('/signup')} className="hover:text-ink">Sign up</button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
