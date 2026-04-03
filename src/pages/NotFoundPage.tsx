import AppButton from '@/components/AppButton'

export default function NotFoundPage() {
  return (
    <section className="card">
      <h1>Page Not Found</h1>
      <p className="hint">The route does not exist. Return to the main explorer pages.</p>
      <div className="row">
        <AppButton to="/characters">Characters</AppButton>
        <AppButton variant="secondary" to="/episodes">
          Episodes
        </AppButton>
        <AppButton variant="secondary" to="/locations">
          Locations
        </AppButton>
      </div>
    </section>
  )
}
