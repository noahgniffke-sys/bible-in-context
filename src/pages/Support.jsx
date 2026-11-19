import { Link } from 'react-router-dom'

function Support() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-sm text-[var(--accent-secondary)] mb-6 inline-block">← Bible in Context</Link>

        <h1 className="text-3xl font-bold mb-2">Support</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">We're here to help.</p>

        <div className="space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Contact us</h2>
            <p>
              For questions, bug reports, feedback, or anything else, email{' '}
              <a
                href="mailto:noahgniffke@gmail.com"
                className="text-[var(--accent-secondary)] underline"
              >
                noahgniffke@gmail.com
              </a>
              . We typically respond within 1–2 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Frequently asked questions</h2>

            <div className="space-y-4 mt-3">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Do I need an account to use the app?</p>
                <p className="mt-1">Yes. Sign in with Apple or Google to open the app. If you are already signed in, the app opens straight to your Bible and you stay signed in on this device.</p>
              </div>

              <div>
                <p className="font-semibold text-[var(--text-primary)]">Which Bible translations are included?</p>
                <p className="mt-1">Berean Standard Bible (BSB), World English Bible (WEB), King James Version (KJV), American Standard Version (ASV), and Young&apos;s Literal Translation (YLT). All five are bundled with the app and work offline.</p>
              </div>

              <div>
                <p className="font-semibold text-[var(--text-primary)]">How do I look up the original Greek or Hebrew?</p>
                <p className="mt-1">Tap any verse to open Verse Context, then tap a word to see its Strong's number and lexicon entry. You can also browse the lexicon directly from the menu.</p>
              </div>

              <div>
                <p className="font-semibold text-[var(--text-primary)]">How do my notes sync across devices?</p>
                <p className="mt-1">When you sign in with Apple or Google, your notes, highlights, prayers, bookmarks, and reading-plan progress sync automatically across every device signed into the same account.</p>
              </div>

              <div>
                <p className="font-semibold text-[var(--text-primary)]">How do I delete my account?</p>
                <p className="mt-1">In the app, open Profile → Privacy & Data → Delete Account. This permanently removes your account and all synced data.</p>
              </div>

              <div>
                <p className="font-semibold text-[var(--text-primary)]">Does the app cost anything?</p>
                <p className="mt-1">No. Bible in Context is completely free with no ads, no in-app purchases, and no subscriptions.</p>
              </div>

              <div>
                <p className="font-semibold text-[var(--text-primary)]">Is my data private?</p>
                <p className="mt-1">Yes. See our <Link to="/privacy" className="text-[var(--accent-secondary)] underline">Privacy Policy</Link> for details. We don't sell or share your data with advertisers.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Report a bug</h2>
            <p>
              Email{' '}
              <a
                href="mailto:noahgniffke@gmail.com?subject=Bible%20in%20Context%20bug%20report"
                className="text-[var(--accent-secondary)] underline"
              >
                noahgniffke@gmail.com
              </a>
              {' '}with:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 mt-2">
              <li>Your device model and iOS version</li>
              <li>The app version (Profile → About)</li>
              <li>What you were doing when the bug happened</li>
              <li>A screenshot if possible</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Support
