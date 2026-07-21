import StarterKit from '@tiptap/starter-kit';
import { createSignal, type Component } from 'solid-js';

import { BubbleMenu, EditorContent, MarkButton } from '../editor';

const PostPage: Component = () => {
  const extensions = [StarterKit];
  const [title, setTitle] = createSignal('');

  return (
    <div class='min-h-screen overflow-x-hidden'>
      <div class='mx-auto max-w-[740px] px-6 py-[15vmin] lg:px-0'>
        <textarea
          value={title()}
          placeholder='Post title'
          rows={1}
          class='mt-2 textarea'
          onInput={(e) => {
            const el = e.currentTarget;
            setTitle(el.value);
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
          }}
        />
        <EditorContent options={{ extensions, autofocus: 'end' }}>
          <BubbleMenu>
            <MarkButton type='bold' />
            <MarkButton type='italic' />
            <MarkButton type='strike' />
            <MarkButton type='code' />
            <MarkButton type='underline' />
          </BubbleMenu>
        </EditorContent>
      </div>
    </div>
  );
};

export default PostPage;
