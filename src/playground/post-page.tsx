import StarterKit from '@tiptap/starter-kit';
import type { Component } from 'solid-js';

import { EditorContent } from '../editor';
import { BubbleMenu } from '../editor/components/bubble-menu';
import { MarkButton } from '../editor/components/mark-button';

const PostPage: Component = () => {
  const extensions = [StarterKit];

  return (
    <div class='mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 pt-16 font-mono'>
      <input type='text' placeholder='Title' class='w-full border-none bg-transparent text-3xl font-semibold outline-none placeholder:text-neutral-400' />
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
  );
};

export default PostPage;
