import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import type { Component } from 'solid-js';

import { BlockDragPreview } from '../editor/block';
import { CustomHorizontalRule } from '../editor/extension/divider';
import { CustomImage } from '../editor/extension/image';
import { SlashCommands } from '../editor/slash';
import { createEditor, EditorContent, EditorProvider } from '../editor/solid';

const PostPage: Component = () => {
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
      SlashCommands,
    ],
    autofocus: 'start',
  }));

  return (
    <div>
      <EditorProvider editor={editor}>
        <EditorContent class='mx-auto mt-[20vh] max-w-[748px] rounded-md border border-gray-200 p-2' />
      </EditorProvider>
    </div>
  );
};

export default PostPage;
