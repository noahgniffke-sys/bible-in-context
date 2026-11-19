import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pluginDir = path.join(
  root,
  'node_modules/@capgo/capacitor-social-login/ios/Sources/SocialLoginPlugin',
)

if (!fs.existsSync(pluginDir)) {
  console.log('social-login plugin is not installed; skipping the Google sign-in fix')
  process.exit(0)
}

const presenterNeedle = `            func login() {
                guard let presentingVc = UIApplication.shared.windows.first?.rootViewController else {`

const presenterReplacement = `            func topPresenter() -> UIViewController? {
                let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
                let active = scenes.filter { $0.activationState == .foregroundActive }
                let pools = active.isEmpty ? scenes : active
                let window = pools.flatMap { $0.windows }.first { $0.isKeyWindow }
                    ?? pools.flatMap { $0.windows }.first
                var top = window?.rootViewController
                while let presented = top?.presentedViewController {
                    top = presented
                }
                return top
            }

            func login() {
                guard let presentingVc = topPresenter() else {`

const urlHandler = `    public override func load() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleCapacitorOpenURL(_:)),
            name: Notification.Name.capacitorOpenURL,
            object: nil
        )
        #if canImport(GoogleSignIn)
        if let url = ApplicationDelegateProxy.shared.lastURL {
            _ = GIDSignIn.sharedInstance.handle(url)
        }
        #endif
    }

    @objc private func handleCapacitorOpenURL(_ notification: Notification) {
        #if canImport(GoogleSignIn)
        guard let dict = notification.object as? [String: Any],
              let url = dict["url"] as? URL else { return }
        _ = GIDSignIn.sharedInstance.handle(url)
        #endif
    }

`

const coldStartReplay = `        #if canImport(GoogleSignIn)
        if let url = ApplicationDelegateProxy.shared.lastURL {
            _ = GIDSignIn.sharedInstance.handle(url)
        }
        #endif
`

function patchPresenter(file) {
  const text = fs.readFileSync(file, 'utf8')
  if (text.includes('func topPresenter()')) {
    console.log('GoogleProvider.swift already finds a live window')
    return
  }
  if (!text.includes(presenterNeedle)) {
    throw new Error('GoogleProvider.swift changed upstream. The sign-in window patch was not applied.')
  }
  fs.writeFileSync(file, text.replace(presenterNeedle, presenterReplacement))
  console.log('patched GoogleProvider.swift')
}

function patchUrlHandler(file) {
  let text = fs.readFileSync(file, 'utf8')
  if (text.includes('ApplicationDelegateProxy.shared.lastURL')) {
    console.log('SocialLoginPlugin.swift already handles the Google return URL')
    return
  }
  if (text.includes('handleCapacitorOpenURL')) {
    const marker = `            name: Notification.Name.capacitorOpenURL,
            object: nil
        )
    }`
    if (!text.includes(marker)) {
      throw new Error('SocialLoginPlugin.swift has a URL handler this script does not recognize.')
    }
    text = text.replace(marker, `            name: Notification.Name.capacitorOpenURL,
            object: nil
        )
${coldStartReplay}    }`)
    fs.writeFileSync(file, text)
    console.log('added the cold-start Google return handler')
    return
  }
  const anchor = `    private var openSecureWindowCall: CAPPluginCall?

    // Helper to get Facebook provider (returns nil if unavailable)`
  if (!text.includes(anchor)) {
    throw new Error('SocialLoginPlugin.swift changed upstream. The return-URL patch was not applied.')
  }
  fs.writeFileSync(file, text.replace(anchor, `    private var openSecureWindowCall: CAPPluginCall?

${urlHandler}    // Helper to get Facebook provider (returns nil if unavailable)`))
  console.log('patched SocialLoginPlugin.swift')
}

patchPresenter(path.join(pluginDir, 'GoogleProvider.swift'))
patchUrlHandler(path.join(pluginDir, 'SocialLoginPlugin.swift'))
