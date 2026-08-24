import type { SuggestionKeyDownProps, SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';

import { SolidRenderer } from '../../solid';
import { getSlashItems, type SlashItem } from './items';
import { SlashMenuList, type SlashMenuListProps } from './slash-menu-list';

export const slashSuggestion: Omit<SuggestionOptions<SlashItem>, 'editor'> = {
  items: ({ query }) => getSlashItems({ query }),

  render: () => {
    let component: SolidRenderer<SlashMenuListProps> | null = null;
    let unmount: (() => void) | null = null;
    let selectedIndex = 0;
    let latest: SuggestionProps<SlashItem> | null = null;

    const destroyPopup = () => {
      unmount?.();
      unmount = null;
      component?.destroy();
      component = null;
    };

    const showPopup = (props: SuggestionProps<SlashItem>) => {
      if (component) {
        component.updateProps({
          items: props.items,
          selectedIndex,
          command: props.command,
        });
        return;
      }

      component = new SolidRenderer(SlashMenuList, {
        editor: props.editor,
        props: {
          items: props.items,
          selectedIndex,
          command: props.command,
        },
        className: 'slash-menu-renderer',
      });
      unmount = props.mount(component.element);
    };

    const sync = () => {
      if (!latest) {
        return;
      }

      if (latest.items.length === 0) {
        destroyPopup();
        return;
      }

      showPopup(latest);
    };

    const selectItem = (index: number) => {
      const item = latest?.items[index];

      if (item) {
        latest?.command(item);
      }
    };

    return {
      onStart: (props) => {
        latest = props;
        selectedIndex = 0;
        sync();
      },

      onUpdate: (props) => {
        latest = props;
        selectedIndex = 0;
        sync();
      },

      onKeyDown: ({ event }: SuggestionKeyDownProps) => {
        if (!latest) {
          return false;
        }

        if (event.key === 'Escape') {
          return true;
        }

        // No matches — don't capture keys; let typing continue as normal text.
        if (latest.items.length === 0 || !component) {
          return false;
        }

        const count = latest.items.length;

        if (event.key === 'ArrowUp') {
          selectedIndex = (selectedIndex + count - 1) % count;
          sync();
          return true;
        }

        if (event.key === 'ArrowDown') {
          selectedIndex = (selectedIndex + 1) % count;
          sync();
          return true;
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },

      onExit: () => {
        destroyPopup();
        latest = null;
      },
    };
  },
};
