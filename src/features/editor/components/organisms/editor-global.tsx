// features/editor/components/EditorProvider.tsx
'use client'
import type { Editor } from '@tiptap/core'
import { EditorContent, EditorContext } from '@tiptap/react'
import { useMemo, type ReactNode } from 'react'

export function EditorProvider({
  editor,
  children,
}: {
  editor: Editor | null
  children: ReactNode
}) {
  // memo bắt buộc — nếu không, mọi render cha sẽ tạo object mới,
  // khiến toàn bộ component con trong context re-render vô ích.
  const value = useMemo(() => ({ editor }), [editor])

  if (!editor) return <div className="editor-skeleton" />

  return (
    <EditorContext.Provider value={value}>
      {children}
      <EditorContent editor={editor} />
    </EditorContext.Provider>
  )
}