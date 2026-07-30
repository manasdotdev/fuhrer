import type { Editor } from '@tiptap/core';
import type { CommandItem, MenuElement } from 'prosemirror-slash-menu';
import type { EditorView } from 'prosemirror-view';

function notInCodeBlock(view: EditorView) {
  return view.state.selection.$from.parent.type.name !== 'codeBlock';
}

/** Default slash commands wired to TipTap chains. */
export function createDefaultSlashItems(getEditor: () => Editor): MenuElement[] {
  const run = (fn: (editor: Editor) => void) => (view: EditorView) => {
    const editor = getEditor();
    if (!editor || editor.view !== view) return;
    fn(editor);
  };

  const item = (id: string, label: string, group: string, fn: (editor: Editor) => void): CommandItem => ({
    id,
    label,
    type: 'command',
    group,
    available: notInCodeBlock,
    command: run(fn),
  });

  return [
    item('horizontalRule', 'Divider', 'Blocks', (ed) => ed.chain().focus().setHorizontalRule().run()),
    item('image', 'Image', 'Blocks', (ed) => ed.chain().focus().insertImageCard().run()),
    item('video', 'Video', 'Blocks', (ed) => ed.chain().focus().insertVideoCard().run()),
    item('audio', 'Audio', 'Blocks', (ed) => ed.chain().focus().insertAudioCard().run()),
    item('embed', 'Embed', 'Blocks', (ed) => ed.chain().focus().insertEmbed().run()),
    item('codeBlock', 'Code block', 'Blocks', (ed) => ed.chain().focus().toggleCodeBlock().run()),
  ];
}
