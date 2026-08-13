// features/editor/extensions/kit.ts
import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'
// import { Mention } from './mention'

// StarterKit (tiptap v3) đã bundle sẵn Link — không add Link riêng nữa để tránh
// "Duplicate extension names found: ['link']"; config link qua option của StarterKit.
export const baseExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5] },
    link: { openOnClick: false, autolink: true },
  }),
  Image,
]