import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Smooth page transition that does NOT unmount children.
 *
 * Instead of key={pathname} (which destroys the DOM → flash), this
 * toggles opacity to create a seamless crossfade whenever the route changes.
 */
export default function PageTransition({ children }) {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(true)
  const prevPath = useRef(pathname)

  useEffect(() => {
    // Only animate when the path actually changes
    if (prevPath.current !== pathname) {
      prevPath.current = pathname

      // Brief fade-out, then snap back to visible for the new content
      setVisible(false)
      const timer = requestAnimationFrame(() => {
        // Wait one frame for the opacity:0 to paint, then fade back in
        requestAnimationFrame(() => {
          setVisible(true)
        })
      })
      return () => cancelAnimationFrame(timer)
    }
  }, [pathname])

  return (
    <div
      className="page-transition-wrapper"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {children}
    </div>
  )
}
