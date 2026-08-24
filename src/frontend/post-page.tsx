import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import type { Component } from 'solid-js';

import { createEditor, EditorContent, EditorProvider } from '../editor/solid';

const PostPage: Component = () => {
  const editor = createEditor(() => ({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write something …',
      }),
    ],
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
