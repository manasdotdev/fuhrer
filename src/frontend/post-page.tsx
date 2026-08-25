import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import type { Component } from 'solid-js';

import { DividerNode } from '../editor/node-blocks/divider';
import { ImageNode } from '../editor/node-blocks/image';
import { createEditor, EditorContent, EditorProvider } from '../editor/solid';

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
    ],
    autofocus: true,
  }));

  const addImage = () => {
    const url = window.prompt('URL');
    if (url) {
      editor()?.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div>
      <button onClick={addImage} class='m-2 cursor-pointer rounded-md bg-green-700 p-2 text-sm font-medium text-white hover:bg-green-800'>
        Add Image
      </button>
      <EditorProvider editor={editor}>
        <EditorContent class='mx-auto mt-[20vh] max-w-186 rounded-md p-2' />
      </EditorProvider>
    </div>
  );
};

export default PostPage;
