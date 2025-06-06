import * as React from 'react'
import { animated } from '@react-spring/web'
import { useWindowResize } from '../hooks/useWindowResize'
import { DockContext } from './DockContext'

interface DockProps {
  children: React.ReactNode
}

export const Dock = ({ children }: DockProps) => {
  const [hovered, setHovered] = React.useState(false)
  const [width, setWidth] = React.useState(0)
  const dockRef = React.useRef<HTMLDivElement>(null!)

  useWindowResize(() => {
    if (dockRef.current) {
        setWidth(dockRef.current.clientWidth)
    }
  })

  return (
    <DockContext.Provider value={{ hovered, width }}>
      <animated.div
        ref={dockRef}
        className="dock-container"
        onMouseOver={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </animated.div>
    </DockContext.Provider>
  )
}