import StarterKit from '@tiptap/starter-kit';
import type { Component } from 'solid-js';
import { Show } from 'solid-js';

import { createEditor, createEditorState, EditorContent } from '../editor/solid';

const PostPage: Component = () => {
  const editor = createEditor(() => ({
    extensions: [StarterKit],
    content: '<p>some content</p>',
  }));

  const toolbar = createEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      italic: current?.isActive('italic') ?? false,
    }),
  });

  return (
    <div class='mx-auto max-w-2xl px-4 pt-16'>
      <Show when={editor()}>
        {(instance) => (
          <div class='mb-3 flex gap-2'>
            <button
              type='button'
              class='rounded border px-2 py-1 text-sm'
              classList={{ 'bg-neutral-200': toolbar().bold }}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => instance().chain().focus().toggleBold().run()}>
              Bold
            </button>
            <button
              type='button'
              class='rounded border px-2 py-1 text-sm'
              classList={{ 'bg-neutral-200': toolbar().italic }}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => instance().chain().focus().toggleItalic().run()}>
              Italic
            </button>
          </div>
        )}
      </Show>

      <EditorContent editor={editor()} class='min-h-40 rounded border border-neutral-300 px-3 py-2 focus-within:border-neutral-500' />
    </div>
  );
};

export default PostPage;
