// features/editor/presets/minimal.ts
import StarterKit from '@tiptap/starter-kit'

// Bình luận không cần heading, image — giới hạn ngay từ preset
// thay vì để người dùng gõ rồi mới chặn ở UI.
// StarterKit (tiptap v3) đã bundle sẵn Link — không add Link riêng nữa để tránh
// "Duplicate extension names found: ['link']"; config link qua option của StarterKit.
export const minimalPreset = {
  extensions: [
    StarterKit.configure({ heading: false, codeBlock: false, link: { openOnClick: false } }),
  ],
  editorProps: {
    attributes: { class: 'prose-sm max-w-none focus:outline-none' },
  },
}