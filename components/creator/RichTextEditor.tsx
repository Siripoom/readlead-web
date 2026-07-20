'use client'

import { Extension } from '@tiptap/core'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { AlignCenter, AlignLeft, AlignRight, Bold, Heading2, IndentIncrease, Italic, List, ListOrdered, Minus, Quote, Strikethrough, UnderlineIcon } from 'lucide-react'
import { useEffect } from 'react'
import { isRichEpisodeContent, plainTextToEpisodeHtml, sanitizeEpisodeHtml } from '@/lib/creator-rich-text'
import styles from './CreatorStudio.module.css'

const ParagraphClasses = Extension.create({
  name: 'paragraphClasses',
  addGlobalAttributes() {
    return [{
      types: ['paragraph'],
      attributes: {
        class: {
          default: null,
          parseHTML: (element) => element.getAttribute('class'),
          renderHTML: (attributes) => attributes.class ? { class: attributes.class } : {},
        },
      },
    }]
  },
})

export default function RichTextEditor({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [StarterKit, Underline, TextAlign.configure({ types: ['heading', 'paragraph'] }), ParagraphClasses],
    content: isRichEpisodeContent(value) ? sanitizeEpisodeHtml(value) : plainTextToEpisodeHtml(value),
    editorProps: { attributes: { class: styles.editor } },
    onUpdate: ({ editor: current }) => onChange(sanitizeEpisodeHtml(current.getHTML())),
  })

  useEffect(() => { editor?.setEditable(!disabled) }, [disabled, editor])
  if (!editor) return <div className={styles.editorShell}><div className={styles.editor}>กำลังเปิดตัวแก้ไข…</div></div>

  const buttons = [
    { label: 'หัวข้อ', Icon: Heading2, active: editor.isActive('heading', { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'ตัวหนา', Icon: Bold, active: editor.isActive('bold'), run: () => editor.chain().focus().toggleBold().run() },
    { label: 'ตัวเอียง', Icon: Italic, active: editor.isActive('italic'), run: () => editor.chain().focus().toggleItalic().run() },
    { label: 'ขีดเส้นใต้', Icon: UnderlineIcon, active: editor.isActive('underline'), run: () => editor.chain().focus().toggleUnderline().run() },
    { label: 'ขีดฆ่า', Icon: Strikethrough, active: editor.isActive('strike'), run: () => editor.chain().focus().toggleStrike().run() },
    { label: 'คำคม', Icon: Quote, active: editor.isActive('blockquote'), run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: 'รายการ', Icon: List, active: editor.isActive('bulletList'), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: 'รายการลำดับ', Icon: ListOrdered, active: editor.isActive('orderedList'), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: 'ชิดซ้าย', Icon: AlignLeft, active: editor.isActive({ textAlign: 'left' }), run: () => editor.chain().focus().setTextAlign('left').run() },
    { label: 'กึ่งกลาง', Icon: AlignCenter, active: editor.isActive({ textAlign: 'center' }), run: () => editor.chain().focus().setTextAlign('center').run() },
    { label: 'ชิดขวา', Icon: AlignRight, active: editor.isActive({ textAlign: 'right' }), run: () => editor.chain().focus().setTextAlign('right').run() },
    { label: 'ย่อบรรทัดแรก', Icon: IndentIncrease, active: editor.getAttributes('paragraph').class === 'first-line-indent', run: () => editor.chain().focus().updateAttributes('paragraph', { class: editor.getAttributes('paragraph').class === 'first-line-indent' ? null : 'first-line-indent' }).run() },
    { label: 'เส้นคั่น', Icon: Minus, active: false, run: () => editor.chain().focus().setHorizontalRule().run() },
  ]
  return <div className={styles.editorShell}>
    <div className={styles.toolbar} role="toolbar" aria-label="จัดรูปแบบเนื้อหา">{buttons.map(({ label, Icon, active, run }) => <button key={label} type="button" title={label} aria-pressed={active} disabled={disabled} onClick={run} className={`${styles.tool} ${active ? styles.toolActive : ''}`}><Icon size={16} /></button>)}</div>
    <EditorContent editor={editor} />
    <div className={styles.editorFooter}><span>รองรับข้อความจัดรูปแบบ ไม่รองรับภาพแทรกในเนื้อหา</span><span>{editor.getText().length.toLocaleString('th-TH')} ตัวอักษร</span></div>
  </div>
}
