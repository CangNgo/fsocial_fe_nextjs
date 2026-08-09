"use client"

import { cn } from '@/shared/lib/utils'
import { ContentResponse } from '@/shared/types/post'
import { useEffect, useRef, useState } from "react"

interface ShowContentProps {
  content: ContentResponse
}
export default function ShowContent({ content }: ShowContentProps) {
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
    setOverflowing(el.scrollHeight > lineHeight * 5 + 1)
  }, [content])

  const clampClass = expanded ? "" : "line-clamp-2"

  return (
    <div onClick={() => setExpanded((prev) => !prev)} className='cursor-pointer active:bg-secondary'>
      {content?.html && content.html !== "null" &&
        (
          <div
            ref={ref}
            className={cn("px-5 mb-1.5", clampClass)}
            dangerouslySetInnerHTML={{ __html: content.html }}
          />
        )
      }
      {overflowing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((prev) => !prev)
          }}
          className="px-5 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  )
}
