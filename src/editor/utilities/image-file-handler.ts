import FileHandler from '@tiptap/extension-file-handler';

export const ImageFileHandler = FileHandler.configure({
  // allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  // allowedMimeTypes: ['image/*'],
  consumePasteEvent: true,
  onDrop: (editor, files, pos) => {
    files
      .filter((file) => file.type.startsWith('image/'))
      .forEach((file) => {
        const src = URL.createObjectURL(file);
        editor.chain().insertContentAt(pos, { type: 'image', attrs: { src } }).run();
      });
  },
  onPaste: (editor, files) => {
    files
      .filter((file) => file.type.startsWith('image/'))
      .forEach((file) => {
        const src = URL.createObjectURL(file);
        editor.chain().focus().setImage({ src }).run();
      });
  },
});
