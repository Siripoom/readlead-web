'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useHorizontalScroll() {
  const rowRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({ active: false, startX: 0, startScroll: 0, moved: false })
  const [canScrollBack, setCanScrollBack] = useState(false)
  const [canScrollForward, setCanScrollForward] = useState(false)

  const updateControls = useCallback(() => {
    const row = rowRef.current
    if (!row) return
    const max = row.scrollWidth - row.clientWidth
    setCanScrollBack(row.scrollLeft > 4)
    setCanScrollForward(max > 4 && row.scrollLeft < max - 4)
  }, [])

  useEffect(() => {
    updateControls()
    const row = rowRef.current
    if (!row) return
    const observer = new ResizeObserver(updateControls)
    observer.observe(row)
    Array.from(row.children).forEach((child) => observer.observe(child))
    window.addEventListener('resize', updateControls)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateControls)
    }
  }, [updateControls])

  const scroll = (direction: -1 | 1, step?: number) => {
    const row = rowRef.current
    if (!row) return
    row.scrollBy({
      left: direction * (step ?? Math.max(280, row.clientWidth * 0.85)),
      behavior: 'smooth',
    })
  }

  const pointerHandlers = {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      const row = rowRef.current
      if (!row) return
      dragState.current = {
        active: true,
        startX: event.clientX,
        startScroll: row.scrollLeft,
        moved: false,
      }
      row.setPointerCapture(event.pointerId)
    },
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      const row = rowRef.current
      const drag = dragState.current
      if (!row || !drag.active) return
      const delta = event.clientX - drag.startX
      if (Math.abs(delta) > 4) drag.moved = true
      row.scrollLeft = drag.startScroll - delta
    },
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => {
      const row = rowRef.current
      if (row?.hasPointerCapture(event.pointerId)) row.releasePointerCapture(event.pointerId)
      dragState.current.active = false
      updateControls()
    },
    onPointerCancel: () => {
      dragState.current.active = false
    },
    onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => {
      if (!dragState.current.moved) return
      event.preventDefault()
      event.stopPropagation()
      dragState.current.moved = false
    },
  }

  return {
    rowRef,
    canScrollBack,
    canScrollForward,
    updateControls,
    scroll,
    pointerHandlers,
  }
}
