import { For, Show, type Component } from 'solid-js';

import type { SlashItem } from './items';

export type SlashMenuListProps = {
  items: SlashItem[];
  selectedIndex: number;
  command: (item: SlashItem) => void;
};

export const SlashMenuList: Component<SlashMenuListProps> = (props) => {
  return (
    <Show when={props.items.length > 0}>
      <div class='slash-menu' role='listbox' aria-label='Slash commands'>
        <For each={props.items}>
          {(item, index) => (
            <button
              type='button'
              role='option'
              class='slash-menu__item'
              classList={{ 'is-selected': index() === props.selectedIndex }}
              aria-selected={index() === props.selectedIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => props.command(item)}
            >
              <span class='slash-menu__title'>{item.title}</span>
              <Show when={item.subtext}>{(subtext) => <span class='slash-menu__subtext'>{subtext()}</span>}</Show>
            </button>
          )}
        </For>
      </div>
    </Show>
  );
};
