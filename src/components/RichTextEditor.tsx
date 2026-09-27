'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect, useState } from 'react';
import {
  Bold,
  Check,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  X,
} from 'lucide-react';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'rich-editor-content',
        'aria-label': 'Post content',
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value || '', { emitUpdate: false });
  }, [editor, value]);

  if (!editor)
    return <div className="rich-editor-loading">Loading editor...</div>;

  function addLink() {
    if (!editor) return;
    setLinkUrl(
      (editor.getAttributes('link').href as string | undefined) ?? 'https://',
    );
    setLinkDialogOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    if (!linkUrl.trim())
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl.trim() })
        .run();
    setLinkDialogOpen(false);
  }

  return (
    <div className="rich-editor">
      <div
        className="rich-editor-toolbar"
        role="toolbar"
        aria-label="Text formatting"
      >
        <button
          type="button"
          title="Heading"
          aria-label="Heading"
          aria-pressed={editor.isActive('heading', { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={16} />
        </button>
        <span className="toolbar-separator" />
        <button
          type="button"
          title="Bold"
          aria-label="Bold"
          aria-pressed={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          title="Italic"
          aria-label="Italic"
          aria-pressed={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          title="Add link"
          aria-label="Add link"
          aria-pressed={editor.isActive('link')}
          onClick={addLink}
        >
          <Link2 size={15} />
        </button>
        <span className="toolbar-separator" />
        <button
          type="button"
          title="Bulleted list"
          aria-label="Bulleted list"
          aria-pressed={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          title="Numbered list"
          aria-label="Numbered list"
          aria-pressed={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          title="Quote"
          aria-label="Quote"
          aria-pressed={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={15} />
        </button>
        <span className="toolbar-spacer" />
        <button
          type="button"
          title="Undo"
          aria-label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={15} />
        </button>
        <button
          type="button"
          title="Redo"
          aria-label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={15} />
        </button>
      </div>
      <EditorContent editor={editor} />
      {linkDialogOpen && (
        <div className="link-dialog">
          <label htmlFor="rich-link-url">Link URL</label>
          <input
            id="rich-link-url"
            type="url"
            autoFocus
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyLink();
              }
              if (event.key === 'Escape') setLinkDialogOpen(false);
            }}
            placeholder="https://example.com"
          />
          <button type="button" aria-label="Apply link" onClick={applyLink}>
            <Check size={15} />
          </button>
          <button
            type="button"
            aria-label="Cancel link"
            onClick={() => setLinkDialogOpen(false)}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
