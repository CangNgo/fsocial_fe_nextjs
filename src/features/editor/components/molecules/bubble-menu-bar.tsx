// features/editor/components/BubbleMenuBar.tsx
import { cn } from "@/shared/lib/utils";
import { useCurrentEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";

const items = [
  { label: "Bold", mark: "bold" as const, action: (editor: NonNullable<ReturnType<typeof useCurrentEditor>["editor"]>) => editor.chain().focus().toggleBold().run() },
  { label: "Italic", mark: "italic" as const, action: (editor: NonNullable<ReturnType<typeof useCurrentEditor>["editor"]>) => editor.chain().focus().toggleItalic().run() },
  { label: "Strike", mark: "strike" as const, action: (editor: NonNullable<ReturnType<typeof useCurrentEditor>["editor"]>) => editor.chain().focus().toggleStrike().run() },
];

export function BubbleMenuBar() {
  const { editor } = useCurrentEditor();

  const activeMarks = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor ? items.map((item) => editor.isActive(item.mark)) : items.map(() => false),
  });

  if (!editor) return null;

  return (
    <BubbleMenu editor={editor}>
      <div className="flex items-center divide-x divide-border rounded-md border bg-popover shadow-md">
        {items.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => item.action(editor)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent",
              activeMarks?.[index] && "bg-muted",
            )}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className="px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
        >
          Clear marks
        </button>
      </div>
    </BubbleMenu>
  );
}