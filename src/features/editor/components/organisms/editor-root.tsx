import type { Editor } from "@tiptap/core"
import { useEffect } from "react"
import { type EditorContent, useAppEditor } from "../../hooks/use-app-editor"
import { fullPreset } from "../../preset/full"
import { minimalPreset } from "../../preset/minimal"
import { BubbleMenuBar } from "../molecules/bubble-menu-bar"
import { EditorProvider } from "./editor-global"
import { Toolbar } from "./tool-bar"


const presets = { full: fullPreset, minimal: minimalPreset }

interface EditorRootProps {
  variant: keyof typeof presets
  initialContent?: object | string
  onChange?: (content: EditorContent) => void
  editable?: boolean
  placeholder?: string
  debounceMs?: number
  extraExtensions?: any[]
  autoFocus?: boolean
  onEditorReady?: (editor: Editor | null) => void
  className?: string
}

export function EditorRoot({
  variant,
  initialContent,
  onChange,
  editable,
  placeholder,
  debounceMs,
  extraExtensions,
  autoFocus,
  onEditorReady,
  className,
}: EditorRootProps) {
  const editor = useAppEditor({
    preset: presets[variant],
    initialContent,
    onChange,
    editable,
    placeholder,
    debounceMs,
    extraExtensions,
    autoFocus,
  })

  useEffect(() => {
    onEditorReady?.(editor)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only notify parent when the editor instance itself changes
  }, [editor])

  return (
    <EditorProvider editor={editor} className={className}>
      {variant === 'full' && <Toolbar />}
      <BubbleMenuBar />
    </EditorProvider>
  )
}