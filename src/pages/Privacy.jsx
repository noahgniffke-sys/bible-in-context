import { Link } from 'react-router-dom'

function Privacy() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-sm text-[var(--accent-secondary)] mb-6 inline-block">← Bible in Context</Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: October 20, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Summary</h2>
            <p>
              Bible in Context is a free Bible-study app. We do not sell or share your data with advertisers. Opening the app requires a sign-in with Apple or Google. We collect only what we need to keep you signed in and sync your study work across your devices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">What we collect</h2>
            <p className="mb-2">If you create an account by signing in with Google or Apple, we receive and store:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Your email address (for sign-in only)</li>
              <li>Your name and avatar (used as your display name and profile picture)</li>
              <li>A username you choose</li>
            </ul>
            <p className="mt-3 mb-2">While you use the app with an account, we store the following so they sync across your devices:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Your notes, highlights, bookmarks, and prayer journal entries</li>
              <li>Your Bible reading plans and progress</li>
              <li>Your follow relationships with other users (if you choose to follow people)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">What we don't collect</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>No location data</li>
              <li>No contacts, photos, microphone, or camera access</li>
              <li>No advertising identifiers (IDFA)</li>
              <li>No analytics, no tracking, no third-party SDKs that track you across apps</li>
              <li>No payment information (the app is free, no purchases)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Where your data is stored</h2>
            <p>
              Account data is stored on Supabase (PostgreSQL hosted on AWS infrastructure) in the United States. Authentication is handled by Google and Apple OAuth — we never see or store your password. Bible text and study tools (lexicons, commentaries, cross-references) are bundled into the app itself and do not require any network connection.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Who can see what</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Notes, highlights, bookmarks, and prayers are private by default — only you can see them.</li>
              <li>You can opt to mark individual highlights or notes as public, in which case they appear on your public profile.</li>
              <li>Your username, display name, avatar, follower count, and any items you have marked public are visible to anyone using the app.</li>
              <li>We never share your data with advertisers or third parties for marketing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Your rights</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Delete your account at any time.</strong> Open the app → Profile → Delete Account. This permanently removes your profile and all associated notes, highlights, bookmarks, prayers, plans, and follow relationships from our database.</li>
              <li><strong>Stay signed in.</strong> The app keeps the Apple or Google account you used. Your study work syncs to that account.</li>
              <li><strong>Export your data.</strong> Contact us and we'll send you a copy of everything we have on you within 30 days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Children's privacy</h2>
            <p>
              Bible in Context is suitable for all ages. We do not knowingly collect personal information from children under 13. If you believe a child has signed in and provided personal information, contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Changes to this policy</h2>
            <p>
              If we make material changes, we will update the date at the top of this page and notify users via an in-app banner. Continued use after the change date constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Contact</h2>
            <p>
              Questions or data requests: <a href="mailto:noahgniffke@gmail.com" className="text-[var(--accent-secondary)] underline">noahgniffke@gmail.com</a>
            </p>
          </section>
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center mt-12">
          Bible in Context — Free, offline-first Bible study.
        </p>
      </div>
    </div>
  )
}

export default Privacy
