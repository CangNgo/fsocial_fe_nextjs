// features/editor/extensions/kit.ts
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
// import { Mention } from './mention'

export const baseExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5] },
  }),
  Link.configure({ openOnClick: false, autolink: true }),
  Image,
]