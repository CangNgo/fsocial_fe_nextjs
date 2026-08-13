// features/editor/components/EditorProvider.tsx
'use client'
import type { Editor } from '@tiptap/core'
import { EditorContent, EditorContext } from '@tiptap/react'
import { useMemo, type ReactNode } from 'react'

export function EditorProvider({
  editor,
  children,
  className,
}: {
  editor: Editor | null
  children: ReactNode
  className?: string
}) {
  const value = useMemo(() => ({ editor }), [editor])

  if (!editor) return <div className="editor-skeleton" />

  return (
    <EditorContext.Provider value={value}>
      {children}
      <EditorContent editor={editor} className={className} />
    </EditorContext.Provider>
  )
}