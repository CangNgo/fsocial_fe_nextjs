import { EditorRoot } from "../components/organisms/editor-root";
import type { EditorContent } from "../hooks/use-app-editor";

interface PostEditorProps {
  content: string
  onSave: (content: EditorContent) => void
  placeholder?: string
}

export function PostEditor({ content, onSave, placeholder }: PostEditorProps) {
  return (
    <EditorRoot
      variant="minimal"
      initialContent={content}
      onChange={onSave}
      placeholder={placeholder}
    />
  )
}