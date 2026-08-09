// features/editor/presets/minimal.ts
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'

// Bình luận không cần heading, image — giới hạn ngay từ preset
// thay vì để người dùng gõ rồi mới chặn ở UI.
export const minimalPreset = {
  extensions: [
    StarterKit.configure({ heading: false, codeBlock: false }),
    Link.configure({ openOnClick: false }),
  ],
  editorProps: {
    attributes: { class: 'prose-sm max-w-none focus:outline-none' },
  },
}