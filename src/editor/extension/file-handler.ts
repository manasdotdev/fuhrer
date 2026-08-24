import type { Editor } from '@tiptap/core';
import FileHandler from '@tiptap/extension-file-handler';

import { imageAltFromFileName, uploadImageAsDataUrl } from '../utils/upload-image';

async function insertImagesFromFiles(editor: Editor, files: File[], pos?: number): Promise<void> {
  if (files.length === 0) {
    return;
  }

  const nodes = [];

  for (const file of files) {
    const src = await uploadImageAsDataUrl(file);
    nodes.push({
      type: 'image',
      attrs: {
        src,
        alt: imageAltFromFileName(file.name),
      },
    });
  }

  if (typeof pos === 'number') {
    editor.chain().focus().insertContentAt(pos, nodes).run();
    return;
  }

  editor.chain().focus().insertContent(nodes).run();
}

/**
 * Editor-level drop / paste of image files → insert `image` nodes.
 * Dropzone blocks handle their own files via Ark UI; this covers the rest of the doc.
 *
 * @see https://tiptap.dev/docs/editor/extensions/functionality/filehandler
 */
export const ImageFileHandler = FileHandler.configure({
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  consumePasteEvent: true,
  onDrop: (editor, files, pos) => {
    void insertImagesFromFiles(editor, files, pos);
  },
  onPaste: (editor, files, htmlContent) => {
    // Prefer HTML paste when the clipboard already has markup (e.g. copied web image).
    if (htmlContent) {
      return;
    }

    void insertImagesFromFiles(editor, files);
  },
});
