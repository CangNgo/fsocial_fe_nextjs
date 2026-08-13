"use client";

import { EditorRoot } from "@/features/editor/components/organisms/editor-root";
import type { EditorContent } from "@/features/editor/hooks/use-app-editor";
import type { Editor } from "@tiptap/core";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { createEnterToSendExtension } from "../../utils/enter-to-send-extension";

interface MessageComposerProps {
  resetKey: number;
  placeholder?: string;
  className?: string;
  onChange: (text: string) => void;
  onSend: () => void;
}

export interface MessageComposerHandle {
  focus: () => void;
}

export const MessageComposer = forwardRef<MessageComposerHandle, MessageComposerProps>(
  function MessageComposer({ resetKey, placeholder, className, onChange, onSend }, ref) {
    const onSendRef = useRef(onSend);
    onSendRef.current = onSend;

    const extensionsRef = useRef([createEnterToSendExtension(onSendRef)]);
    const editorRef = useRef<Editor | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.commands.focus("end"),
    }));

    return (
      <EditorRoot
        key={resetKey}
        variant="minimal"
        placeholder={placeholder}
        className={className}
        debounceMs={0}
        autoFocus
        extraExtensions={extensionsRef.current}
        onChange={({ text }: EditorContent) => onChange(text)}
        onEditorReady={(editor) => {
          editorRef.current = editor;
        }}
      />
    );
  },
);
