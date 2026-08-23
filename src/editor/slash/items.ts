import type { Editor, Range } from '@tiptap/core';

export type SlashItem = {
  title: string;
  subtext?: string;
  aliases?: string[];
  group?: string;
  command: (props: { editor: Editor; range: Range }) => void;
};

const SLASH_ITEMS: SlashItem[] = [
  {
    title: 'Image',
    subtext: 'Embed an image from a URL',
    aliases: ['img', 'picture', 'photo'],
    group: 'Media',
    command: ({ editor, range }) => {
      const url = window.prompt('Image URL');

      if (!url) {
        editor.chain().focus().deleteRange(range).run();
        return;
      }

      editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
    },
  },
  {
    title: 'Divider',
    subtext: 'Horizontal rule',
    aliases: ['hr', 'line', 'separator'],
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];

function matchesQuery(item: SlashItem, query: string): boolean {
  const q = query.toLowerCase().trim();

  if (!q) {
    return true;
  }

  if (item.title.toLowerCase().includes(q)) {
    return true;
  }

  if (item.subtext?.toLowerCase().includes(q)) {
    return true;
  }

  return item.aliases?.some((alias) => alias.toLowerCase().includes(q)) ?? false;
}

export function getSlashItems({ query }: { query: string }): SlashItem[] {
  return SLASH_ITEMS.filter((item) => matchesQuery(item, query));
}
