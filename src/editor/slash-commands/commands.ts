import type { Editor, Range } from '@tiptap/core';

export type SlashCommandIcon = 'image' | 'video' | 'divider' | 'heading';

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
      editor.chain().focus().deleteRange(range).insertImageUpload().run();
    },
  },
  {
    title: 'Video',
    icon: 'video',
    keywords: ['movie', 'mp4', 'webm', 'clip'],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertVideo().run();
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
