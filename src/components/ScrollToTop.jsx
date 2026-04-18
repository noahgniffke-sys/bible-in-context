import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const scrollPositions = {}

function ScrollToTop() {
  const { pathname } = useLocation()
  const prevPath = useRef(pathname)

  useEffect(() => {
    // Save scroll position of the page we're leaving
    if (prevPath.current !== pathname) {
      scrollPositions[prevPath.current] = window.scrollY
      prevPath.current = pathname
    }

    // Restore scroll position if we've been to this page before, else scroll to top
    if (scrollPositions[pathname] !== undefined) {
      // Small delay to let the page render first
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositions[pathname])
      })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}

export default ScrollToTop
