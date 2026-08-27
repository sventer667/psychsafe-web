// Pre-launch placeholder. Shown for every route while VITE_MAINTENANCE_MODE
// is "true" (see App.tsx), so the app stays fully built behind it but isn't
// reachable via any direct link. Turning the site back on is a one-line env
// var change on Render, no code changes needed.
export function ComingSoon() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center">
      <p className="font-serif text-2xl font-bold tracking-tight text-navy-contrast">
        Connexus
      </p>
      <div className="mt-6 h-px w-12 bg-accent" />
      <h1 className="mt-6 font-serif text-3xl font-bold text-navy-contrast sm:text-4xl">
        We're launching soon.
      </h1>
      <p className="mt-4 max-w-md text-base text-navy-contrast/70">
        Connexus, a platform for managing workplace psychosocial risk, is being finalised. Check back shortly.
      </p>
      <p className="mt-8 text-sm text-navy-contrast/60">
        In the meantime, reach us at{' '}
        <a href="mailto:contact@connexusohs.com.au" className="text-accent underline underline-offset-2">
          contact@connexusohs.com.au
        </a>
      </p>
    </div>
  )
}
