import StarterKit from '@tiptap/starter-kit';
import { type Component } from 'solid-js';

import { EditorContent } from './bridge/editor-content';

const PostPage: Component = () => {
  return (
    <div class='mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 pt-16 font-mono'>
      <input type='text' placeholder='Title' class='w-full border-none bg-transparent text-3xl font-semibold outline-none placeholder:text-neutral-400' />
      <EditorContent
        options={{
          extensions: [StarterKit],
          autofocus: 'end',
          editorProps: {
            attributes: {
              class: 'tiptap min-h-[50vh] outline-none border rounded-sm p-2',
            },
          },
        }}
      />
    </div>
  );
};

export default PostPage;
