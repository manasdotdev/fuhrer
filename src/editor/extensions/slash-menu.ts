import { Extension, type Editor } from '@tiptap/core';
import { SlashMenuPlugin, type MenuElement } from 'prosemirror-slash-menu';

import { createDefaultSlashItems } from '../utils/default-slash-items';

export type SlashMenuExtensionOptions = {
  /** Override the default item list. Receives the TipTap editor. */
  items?: (editor: Editor) => MenuElement[];
};

/**
 * TipTap wrapper around headless `prosemirror-slash-menu`.
 * High priority so Arrow/Enter/Escape are handled before other keymaps.
 */
export const SlashMenuExtension = Extension.create<SlashMenuExtensionOptions>({
  name: 'slashMenu',
  priority: 1000,

  addOptions() {
    return {
      items: undefined,
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    const items = this.options.items?.(editor) ?? createDefaultSlashItems(() => editor);
    // inlineFilter defaults false: `/` + filter stay in plugin state (not inserted into the doc)
    return [SlashMenuPlugin(items)];
  },
});
