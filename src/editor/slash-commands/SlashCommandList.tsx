import { For, type Component, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { ICONS } from '../styles/icons';
import type { SlashCommandIcon, SlashCommandItem } from './commands';

import styles from '../styles/slash-commands.module.css';

const ICON_BY_NAME: Record<SlashCommandIcon, () => JSX.Element> = {
  image: ICONS.Image,
  divider: ICONS.Divider,
  heading: ICONS.Heading,
};

export type SlashCommandListProps = {
  items: SlashCommandItem[];
  selectedIndex: number;
  command: (item: SlashCommandItem) => void;
  onHover: (index: number) => void;
};

export const SlashCommandList: Component<SlashCommandListProps> = (props) => {
  return (
    <div class={styles.menu}>
      <div class={styles.header}>
        <span class={styles.headerLabel}>Primary</span>
        <span class={styles.help} title='Slash commands'>
          ?
        </span>
      </div>
      <div class={styles.list}>
        <For each={props.items}>
          {(item, index) => (
            <button
              type='button'
              class={styles.item}
              classList={{ [styles.active]: index() === props.selectedIndex }}
              onMouseEnter={() => props.onHover(index())}
              onClick={() => props.command(item)}>
              <span class={styles.icon}>
                <Dynamic component={ICON_BY_NAME[item.icon]} />
              </span>
              <span class={styles.label}>{item.title}</span>
            </button>
          )}
        </For>
      </div>
    </div>
  );
};
