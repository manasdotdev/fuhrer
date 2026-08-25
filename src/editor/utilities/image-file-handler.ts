import type { Editor } from '@tiptap/core';
import FileHandler from '@tiptap/extension-file-handler';

function insertMediaNode(editor: Editor, type: 'imageUpload' | 'video', src: string, pos?: number) {
  const content = {
    type,
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
    files.forEach((file) => {
      const src = URL.createObjectURL(file);
      if (file.type.startsWith('image/')) {
        insertMediaNode(editor, 'imageUpload', src, pos);
      } else if (file.type.startsWith('video/')) {
        insertMediaNode(editor, 'video', src, pos);
      }
    });
  },
  onPaste: (editor, files) => {
    files.forEach((file) => {
      const src = URL.createObjectURL(file);
      if (file.type.startsWith('image/')) {
        insertMediaNode(editor, 'imageUpload', src);
      } else if (file.type.startsWith('video/')) {
        insertMediaNode(editor, 'video', src);
      }
    });
  },
});
