import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import type { Component } from 'solid-js';
import { Show } from 'solid-js';

import { BlockDragPreview } from '../editor/block';
import { CustomHorizontalRule } from '../editor/extension/divider';
import { CustomImage } from '../editor/extension/image';
import { createEditor, EditorContent, EditorProvider } from '../editor/solid';

const PostPage: Component = () => {
  const editor = createEditor(() => ({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        gapcursor: false,
        // Green destination line while dragging blocks
        // https://tiptap.dev/docs/editor/extensions/functionality/dropcursor
        dropcursor: {
          color: '#22c55e',
          width: 3,
        },
      }),
      Placeholder.configure({ placeholder: 'Write something …' }),
      BlockDragPreview,
      CustomHorizontalRule,
      CustomImage,
    ],
  }));

  const addImage = () => {
    const url = window.prompt('URL');

    if (url) {
      editor()?.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div>
      <Show when={editor()}>
        <div class='mx-auto mb-3 max-w-[748px] px-2'>
          <button type='button' class='rounded border border-neutral-300 px-2 py-1 text-sm' onMouseDown={(event) => event.preventDefault()} onClick={addImage}>
            Set image
          </button>
        </div>
      </Show>

      <EditorProvider editor={editor}>
        <EditorContent class='mx-auto mt-[20vh] max-w-[748px] rounded-md border border-gray-200 p-2' />
      </EditorProvider>
    </div>
  );
};

export default PostPage;
