import type { JSONContent } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import { createSignal, type Component } from 'solid-js';

import { Audio, BubbleMenu, createTitleBodyBridge, EditorContent, Image, LinkToolbar, MarkButton, MenuDivider, SlashMenu, SlashMenuExtension, Video } from '../editor';
import { ExportToJson } from '../editor/components/export-to-json';

const PostPage: Component = () => {
  const bridge = createTitleBodyBridge();
  const [title, setTitle] = createSignal('');
  const [doc, setDoc] = createSignal<JSONContent | undefined>();

  const extensions = [
    SlashMenuExtension,
    StarterKit,
    Image,
    Video,
    Audio,
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

  const options = bridge.withEditorOptions({
    extensions,
    onCreate: ({ editor }) => setDoc(editor.getJSON()),
    onUpdate: ({ editor }) => setDoc(editor.getJSON()),
  });

  return (
    <div class='min-h-screen overflow-x-hidden'>
      <ExportToJson
        disabled={!doc()}
        filename={() => title().trim().toLowerCase().replace(/\s+/g, '-').slice(0, 40) || 'post'}
        data={() => {
          const body = doc() ?? bridge.editor()?.getJSON();
          if (!body) return null;
          return { title: title(), body };
        }}
      />
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
          <SlashMenu />
        </EditorContent>
      </div>
    </div>
  );
};

export default PostPage;
