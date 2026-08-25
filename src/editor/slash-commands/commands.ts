import type { Editor, Range } from '@tiptap/core';

export type SlashCommandIcon = 'image' | 'divider' | 'heading';

export type SlashCommandItem = {
  title: string;
  icon: SlashCommandIcon;
  keywords?: string[];
  command: (props: { editor: Editor; range: Range }) => void;
};

export const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    title: 'Image',
    icon: 'image',
    keywords: ['img', 'photo', 'picture'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const url = window.prompt('URL');
      if (url) editor.chain().focus().setImage({ src: url }).run();
    },
  },
  {
    title: 'Divider',
    icon: 'divider',
    keywords: ['hr', 'line', 'separator'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: 'Heading 1',
    icon: 'heading',
    keywords: ['h1', 'title'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
];
