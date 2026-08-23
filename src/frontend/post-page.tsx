import StarterKit from '@tiptap/starter-kit';
import type { Component } from 'solid-js';

import { EditorContent, EditorProvider, createEditor, createEditorState, useEditorContext } from '../editor/solid';
import { CounterExtension } from './counter-extension';

const Toolbar: Component = () => {
  const editor = useEditorContext();

  const toolbar = createEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      italic: current?.isActive('italic') ?? false,
    }),
  });

  return (
    <div class='mb-3 flex gap-2'>
      <button
        type='button'
        class='rounded border px-2 py-1 text-sm'
        classList={{ 'bg-neutral-200': toolbar().bold }}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor()?.chain().focus().toggleBold().run()}>
        Bold
      </button>
      <button
        type='button'
        class='rounded border px-2 py-1 text-sm'
        classList={{ 'bg-neutral-200': toolbar().italic }}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor()?.chain().focus().toggleItalic().run()}>
        Italic
      </button>
      <button
        type='button'
        class='rounded border px-2 py-1 text-sm'
        onMouseDown={(event) => event.preventDefault()}
        onClick={() =>
          editor()
            ?.chain()
            .focus()
            .insertContent({ type: 'counter', attrs: { count: 0 } })
            .run()
        }>
        Insert counter
      </button>
    </div>
  );
};

const PostPage: Component = () => {
  const editor = createEditor(() => ({
    extensions: [StarterKit, CounterExtension],
    content: `
      <p>TipTap + Solid — type here, or insert a counter node.</p>
      <div data-type="counter" count="3"></div>
      <p>Node views render as real Solid components.</p>
    `,
  }));

  return (
    <div class='mx-auto max-w-2xl px-4 pt-16'>
      <EditorProvider editor={editor}>
        {/* the editor instance is provided to the context*/}
        <Toolbar />
        <EditorContent class='min-h-40 rounded border border-neutral-300 px-3 py-2 focus-within:border-neutral-500' />
        {/* so no need to pass it down, directly use the EditorContent component */}
      </EditorProvider>
    </div>
  );
};

export default PostPage;
