// features/editor/components/Toolbar.tsx
import { useCurrentEditor, useEditorState } from '@tiptap/react'

export function Toolbar() {
  const { editor } = useCurrentEditor()

  // useEditorState với selector: chỉ re-render khi bold/italic đổi,
  // không re-render mỗi keystroke như khi đọc trực tiếp editor.isActive().
  const state = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null
      return {
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        isHeading: editor.isActive('heading', { level: 2 }),
      }
    },
  })

  if (!editor || !state) return null

  return (
    <div className="editor-toolbar flex gap-x-2">
      <span
        className={`${state.isBold ? 'active bg-secondary' : ''} px-2 py-1 rounded-lg cursor-pointer hover:bg-secondary`}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        Bold
      </span>
      <span
        className={`${state.isItalic ? 'active bg-secondary' : ''} px-2 py-1 rounded-lg cursor-pointer hover:bg-secondary`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        Italic
      </span>
      <span
        className={`${state.isHeading ? 'active bg-secondary' : ''} px-2 py-1 rounded-lg cursor-pointer hover:bg-secondary`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </span>
    </div>
  )
}