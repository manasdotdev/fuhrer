import type { Editor } from '@tiptap/core';
import FileHandler from '@tiptap/extension-file-handler';

function insertImageUpload(editor: Editor, src: string, pos?: number) {
  const content = {
    type: 'imageUpload',
    attrs: { src, caption: '', alt: '' },
  };

  if (typeof pos === 'number') {
    editor.chain().insertContentAt(pos, content).run();
    return;
  }

  editor.chain().focus().insertContent(content).run();
}

export const ImageFileHandler = FileHandler.configure({
  consumePasteEvent: true,
  onDrop: (editor, files, pos) => {
    files
      .filter((file) => file.type.startsWith('image/'))
      .forEach((file) => {
        insertImageUpload(editor, URL.createObjectURL(file), pos);
      });
  },
  onPaste: (editor, files) => {
    files
      .filter((file) => file.type.startsWith('image/'))
      .forEach((file) => {
        insertImageUpload(editor, URL.createObjectURL(file));
      });
  },
});
