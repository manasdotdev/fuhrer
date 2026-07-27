import Link from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import { createSignal, type Component } from 'solid-js';

import { BubbleMenu, createTitleBodyBridge, EditorContent, LinkToolbar, MarkButton, MenuDivider } from '../editor';

const PostPage: Component = () => {
  const bridge = createTitleBodyBridge();
  const [title, setTitle] = createSignal('');

  const extensions = [
    StarterKit,
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
    }),
    Placeholder.configure({
      placeholder: 'Begin writing your post...',
      showOnlyCurrent: false,
    }),
  ];

  const options = bridge.withEditorOptions({ extensions });

  return (
    <div class='min-h-screen overflow-x-hidden'>
      <div class='mx-auto max-w-[740px] px-6 py-[15vmin] lg:px-0'>
        <textarea
          ref={bridge.setTitleEl}
          autofocus
          value={title()}
          placeholder='Post title'
          rows={1}
          class='mt-2 textarea'
          onKeyDown={bridge.onTitleKeyDown}
          onInput={(e) => {
            const el = e.currentTarget;
            setTitle(el.value);
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
          }}
        />
        <EditorContent options={options}>
          <LinkToolbar>
            <BubbleMenu>
              <MarkButton type='bold' />
              <MarkButton type='italic' />
              <MarkButton type='heading2' />
              <MarkButton type='heading3' />
              <MenuDivider />
              <MarkButton type='quote' />
              <MarkButton type='link' />
              <MenuDivider />
              <MarkButton type='snippet' />
            </BubbleMenu>
          </LinkToolbar>
        </EditorContent>
      </div>
    </div>
  );
};

export default PostPage;
