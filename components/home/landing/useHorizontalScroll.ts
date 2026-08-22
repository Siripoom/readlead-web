'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type HorizontalScrollOptions = {
  autoplayMs?: number
  stopAutoplayAfterInteraction?: boolean
}

export function useHorizontalScroll({
  autoplayMs,
  stopAutoplayAfterInteraction = false,
}: HorizontalScrollOptions = {}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({ active: false, startX: 0, startScroll: 0, moved: false })
  const autoplayStopped = useRef(false)
  const [canScrollBack, setCanScrollBack] = useState(false)
  const [canScrollForward, setCanScrollForward] = useState(false)
  const [activePage, setActivePage] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [isInteracting, setIsInteracting] = useState(false)
  const [documentHidden, setDocumentHidden] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const metrics = useCallback(() => {
    const row = rowRef.current
    const firstChild = row?.firstElementChild as HTMLElement | null
    if (!row || !firstChild) return null
    const styles = window.getComputedStyle(row)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
    const itemStep = firstChild.getBoundingClientRect().width + gap
    const visibleItems = Math.max(1, Math.floor((row.clientWidth + gap + 0.5) / itemStep))
    const count = row.children.length
    const pages = Math.max(1, Math.ceil(count / visibleItems))
    const pageStep = itemStep * visibleItems
    return { pages, pageStep, maxScroll: Math.max(0, row.scrollWidth - row.clientWidth) }
  }, [])

  const updateControls = useCallback(() => {
    const row = rowRef.current
    if (!row) return
    const max = row.scrollWidth - row.clientWidth
    setCanScrollBack(row.scrollLeft > 4)
    setCanScrollForward(max > 4 && row.scrollLeft < max - 4)
    const layout = metrics()
    if (!layout) return
    setPageCount(layout.pages)
    const page = layout.maxScroll > 0
      ? Math.round((row.scrollLeft / layout.maxScroll) * (layout.pages - 1))
      : 0
    setActivePage(Math.min(layout.pages - 1, Math.max(0, page)))
  }, [metrics])

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

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => setReducedMotion(media.matches)
    const syncVisibility = () => setDocumentHidden(document.hidden)
    syncMotion()
    syncVisibility()
    media.addEventListener('change', syncMotion)
    document.addEventListener('visibilitychange', syncVisibility)
    return () => {
      media.removeEventListener('change', syncMotion)
      document.removeEventListener('visibilitychange', syncVisibility)
    }
  }, [])

  const scrollToPage = useCallback((page: number, userInitiated = false) => {
    const row = rowRef.current
    const layout = metrics()
    if (!row || !layout) return
    if (userInitiated && stopAutoplayAfterInteraction) autoplayStopped.current = true
    const normalizedPage = ((page % layout.pages) + layout.pages) % layout.pages
    row.scrollTo({
      left: normalizedPage === layout.pages - 1
        ? layout.maxScroll
        : Math.min(normalizedPage * layout.pageStep, layout.maxScroll),
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }, [metrics, reducedMotion, stopAutoplayAfterInteraction])

  useEffect(() => {
    if (
      !autoplayMs ||
      pageCount <= 1 ||
      isInteracting ||
      documentHidden ||
      reducedMotion ||
      autoplayStopped.current
    ) return
    const timer = window.setInterval(() => scrollToPage(activePage + 1), autoplayMs)
    return () => window.clearInterval(timer)
  }, [activePage, autoplayMs, documentHidden, isInteracting, pageCount, reducedMotion, scrollToPage])

  const scroll = (direction: -1 | 1, step?: number) => {
    const row = rowRef.current
    if (!row) return
    row.scrollBy({
      left: direction * (step ?? Math.max(280, row.clientWidth * 0.85)),
      behavior: 'smooth',
    })
  }

  const beginInteraction = () => {
    setIsInteracting(true)
    if (stopAutoplayAfterInteraction) autoplayStopped.current = true
  }

  const endInteraction = () => {
    setIsInteracting(false)
    window.requestAnimationFrame(updateControls)
  }

  const pointerHandlers = {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      beginInteraction()
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      const row = rowRef.current
      if (!row) return
      dragState.current = {
        active: true,
        startX: event.clientX,
        startScroll: row.scrollLeft,
        moved: false,
      }
    },
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      const row = rowRef.current
      const drag = dragState.current
      if (!row || !drag.active) return
      const delta = event.clientX - drag.startX
      if (Math.abs(delta) > 4 && !drag.moved) {
        drag.moved = true
        row.setPointerCapture(event.pointerId)
      }
      if (!drag.moved) return
      row.scrollLeft = drag.startScroll - delta
    },
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => {
      const row = rowRef.current
      if (row?.hasPointerCapture(event.pointerId)) row.releasePointerCapture(event.pointerId)
      dragState.current.active = false
      endInteraction()
    },
    onPointerCancel: () => {
      dragState.current.active = false
      endInteraction()
    },
    onPointerLeave: () => {
      if (!dragState.current.active) setIsInteracting(false)
    },
    onWheel: () => {
      if (stopAutoplayAfterInteraction) autoplayStopped.current = true
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
    activePage,
    pageCount,
    updateControls,
    scroll,
    scrollToPage,
    pointerHandlers,
  }
}
