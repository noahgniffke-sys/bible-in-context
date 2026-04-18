let CapacitorHaptics = null
let ImpactStyle = null

async function loadCapacitorHaptics() {
  try {
    const module = await import('@capacitor/haptics')
    CapacitorHaptics = module.Haptics
    ImpactStyle = module.ImpactStyle
    return true
  } catch {
    return false
  }
}

loadCapacitorHaptics()

export const HapticStyle = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning'
}

const webVibrationPatterns = {
  [HapticStyle.LIGHT]: 10,
  [HapticStyle.MEDIUM]: 25,
  [HapticStyle.HEAVY]: 40,
  [HapticStyle.SUCCESS]: [15, 50, 15],
  [HapticStyle.ERROR]: [25, 50, 25, 50, 25],
  [HapticStyle.WARNING]: [35, 100, 35]
}

export function triggerHaptic(style = HapticStyle.LIGHT) {
  if (CapacitorHaptics) {
    try {
      if (style === HapticStyle.SUCCESS || style === HapticStyle.ERROR || style === HapticStyle.WARNING) {
        CapacitorHaptics.notification({
          type: style === HapticStyle.SUCCESS ? 'success' :
                style === HapticStyle.ERROR ? 'error' : 'warning'
        }).catch(() => {})
      } else {
        const impactMap = {
          [HapticStyle.LIGHT]: 'Light',
          [HapticStyle.MEDIUM]: 'Medium',
          [HapticStyle.HEAVY]: 'Heavy'
        }
        CapacitorHaptics.impact({
          style: ImpactStyle?.[impactMap[style]] || ImpactStyle?.Light
        }).catch(() => {})
      }
    } catch {}
  } else if (navigator.vibrate) {
    try {
      const pattern = webVibrationPatterns[style] || webVibrationPatterns[HapticStyle.LIGHT]
      navigator.vibrate(pattern)
    } catch {}
  }
}

export function useHaptic() {
  return triggerHaptic
}

export function withHaptic(handler, style = HapticStyle.LIGHT) {
  return (...args) => {
    triggerHaptic(style)
    if (handler) return handler(...args)
  }
}
