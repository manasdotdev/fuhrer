import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import type { Component } from 'solid-js';

import { CustomHorizontalRule } from '../extension/divider';
import { ImageFileHandler } from '../extension/file-handler';
import { CustomImage } from '../extension/image';
import { ImageUpload } from '../extension/image-upload';
import { createEditor, EditorContent, EditorProvider } from '../solid';
import { BlockDragPreview } from '../utils/node-block';
import { SlashCommands } from '../utils/slash-menu';

const FuhrerEditor: Component = () => {
  const editor = createEditor(() => ({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        gapcursor: false,
        dropcursor: {
          color: '#22c55e',
          width: 3,
        },
      }),
      Placeholder.configure({ placeholder: 'Write something …' }),
      BlockDragPreview,
      CustomHorizontalRule,
      CustomImage,
      ImageUpload,
      ImageFileHandler,
      SlashCommands,
    ],
    autofocus: 'start',
  }));

  return (
    <EditorProvider editor={editor}>
      <EditorContent class='mx-auto mt-[20vh] max-w-[748px] rounded-md border border-gray-200 p-4' />
    </EditorProvider>
  );
};

export default FuhrerEditor;
