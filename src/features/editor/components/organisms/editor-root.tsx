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
}

export function EditorRoot({ variant, initialContent, onChange, editable, placeholder }: EditorRootProps) {
  const editor = useAppEditor({
    preset: presets[variant],
    initialContent,
    onChange,
    editable,
    placeholder,
  })

  return (
    <EditorProvider editor={editor}>
      {variant === 'full' && <Toolbar />}
      <BubbleMenuBar />
    </EditorProvider>
  )
}