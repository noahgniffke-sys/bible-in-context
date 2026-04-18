import { useRef, useCallback, useEffect, useState } from 'react'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

const THRESHOLD = 80
const MAX_PULL = 120
const DAMPING = 0.4
const SAFETY_TIMEOUT = 5000

function findScrollParent(el) {
  let node = el
  while (node && node !== document.body) {
    const style = getComputedStyle(node)
    const overflow = style.overflowY
    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node
    }
    node = node.parentElement
  }
  return null
}

export default function usePullToRefresh(onRefresh, { scrollRef } = {}) {
  const containerRef = useRef(null)
  const onRefreshRef = useRef(onRefresh)
  const startYRef = useRef(0)
  const pullingRef = useRef(false)
  const refreshingRef = useRef(false)
  const hapticFiredRef = useRef(false)
  const pullDistanceRef = useRef(0)

  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  const getScrollEl = useCallback(() => {
    if (scrollRef?.current) return scrollRef.current
    if (containerRef.current) return findScrollParent(containerRef.current)
    return null
  }, [scrollRef])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function onTouchStart(e) {
      if (refreshingRef.current) return
      const scrollEl = getScrollEl()
      const scrollTop = scrollEl ? scrollEl.scrollTop : 0
      if (scrollTop > 0) return
      startYRef.current = e.touches[0].clientY
      pullingRef.current = true
      hapticFiredRef.current = false
    }

    function onTouchMove(e) {
      if (!pullingRef.current || refreshingRef.current) return
      const scrollEl = getScrollEl()
      const scrollTop = scrollEl ? scrollEl.scrollTop : 0
      if (scrollTop > 0) {
        pullingRef.current = false
        pullDistanceRef.current = 0
        setPullDistance(0)
        return
      }
      const deltaY = e.touches[0].clientY - startYRef.current
      if (deltaY <= 0) {
        pullDistanceRef.current = 0
        setPullDistance(0)
        return
      }
      e.preventDefault()
      const distance = Math.min(deltaY * DAMPING, MAX_PULL)
      pullDistanceRef.current = distance
      requestAnimationFrame(() => setPullDistance(distance))
      if (distance >= THRESHOLD && !hapticFiredRef.current) {
        hapticFiredRef.current = true
        triggerHaptic(HapticStyle.MEDIUM)
      }
    }

    function onTouchEnd() {
      if (!pullingRef.current || refreshingRef.current) return
      pullingRef.current = false
      if (pullDistanceRef.current >= THRESHOLD) {
        refreshingRef.current = true
        setRefreshing(true)
        setPullDistance(THRESHOLD)
        const timeout = setTimeout(() => {
          refreshingRef.current = false
          setRefreshing(false)
          setPullDistance(0)
          pullDistanceRef.current = 0
        }, SAFETY_TIMEOUT)
        let result
        try { result = onRefreshRef.current() } catch {}
        Promise.resolve(result).catch(() => {}).finally(() => {
          clearTimeout(timeout)
          refreshingRef.current = false
          setRefreshing(false)
          setPullDistance(0)
          pullDistanceRef.current = 0
        })
      } else {
        setPullDistance(0)
        pullDistanceRef.current = 0
      }
    }

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    container.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
    }
  }, [getScrollEl])

  return { indicatorProps: { pullDistance, refreshing }, containerRef }
}
