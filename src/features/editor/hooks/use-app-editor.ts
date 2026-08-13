'use client'
import Placeholder from '@tiptap/extension-placeholder'
import { useEditor } from '@tiptap/react';
import { useCallback, useRef } from 'react';

type Preset = { extensions: any[]; editorProps?: Record<string, unknown>; placeholder?: string }

export interface EditorContent {
  json: object
  html: string
  text: string
}

interface UseAppEditorOptions {
  preset: Preset
  initialContent?: string | object
  onChange?: (content: EditorContent) => void
  editable?: boolean
  debounceMs?: number
  placeholder?: string
  extraExtensions?: any[]
  autoFocus?: boolean
}

export function useAppEditor({
  preset,
  initialContent,
  onChange,
  editable = true,
  debounceMs = 500,
  placeholder,
  extraExtensions,
  autoFocus,
}: UseAppEditorOptions) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const debouncedChange = useCallback(
    (content: EditorContent) => {
      if (!onChange) return
      clearTimeout(timer.current)
      timer.current = setTimeout(() => onChange(content), debounceMs)
    },
    [onChange, debounceMs],
  )

  const resolvedPlaceholder = placeholder ?? preset.placeholder
  const extensions = [
    ...preset.extensions,
    ...(resolvedPlaceholder ? [Placeholder.configure({ placeholder: resolvedPlaceholder })] : []),
    ...(extraExtensions ?? []),
  ]

  return useEditor({
    // Bắt buộc cho Next.js / mọi app SSR — tránh hydration mismatch
    // vì Tiptap chỉ chạy được ở client (phụ thuộc DOM/ProseMirror).
    immediatelyRender: false,
    extensions,
    editorProps: preset.editorProps,
    content: initialContent,
    editable,
    autofocus: autoFocus ?? false,
    onUpdate: ({ editor }) =>
      debouncedChange({ json: editor.getJSON(), html: editor.getHTML(), text: editor.getText() }),
  })
}