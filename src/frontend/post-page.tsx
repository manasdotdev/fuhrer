import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import type { Component } from 'solid-js';

import { DividerNode } from '../editor/node-blocks/divider';
import { ImageNode, ImageUploadNode } from '../editor/node-blocks/image';
import { VideoNode } from '../editor/node-blocks/video';
import { SlashCommands } from '../editor/slash-commands/slash-commands';
import { createEditor, EditorContent, EditorProvider } from '../editor/solid-bindings';
import { ImageFileHandler } from '../editor/utilities/image-file-handler';

const PostPage: Component = () => {
  const editor = createEditor(() => ({
    extensions: [
      StarterKit.configure({
        gapcursor: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: 'Write something …',
      }),
      // Custom nodes
      DividerNode,
      ImageNode,
      ImageUploadNode,
      VideoNode,
      // helper extensions
      ImageFileHandler,
      SlashCommands,
    ],
    autofocus: true,
  }));

  return (
    <div>
      <EditorProvider editor={editor}>
        <EditorContent class='mx-auto mt-[20vh] max-w-186 rounded-md p-2' />
      </EditorProvider>
    </div>
  );
};

export default PostPage;
