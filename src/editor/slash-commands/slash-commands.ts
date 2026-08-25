import type { Editor } from '@tiptap/core';
import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { exitSuggestion, type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion';

import { SolidRenderer } from '../solid-bindings';
import { SLASH_COMMANDS, type SlashCommandItem } from './commands';
import { SlashCommandList, type SlashCommandListProps } from './SlashCommandList';

const SlashCommandsPluginKey = new PluginKey('slashCommands');

function filterCommands(query: string): SlashCommandItem[] {
  const q = query.toLowerCase();
  return SLASH_COMMANDS.filter((item) => item.title.toLowerCase().includes(q) || item.keywords?.some((k) => k.includes(q))).slice(0, 10);
}

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        pluginKey: SlashCommandsPluginKey,
        startOfLine: false,
        allowedPrefixes: [' '],
        items: ({ query }: { query: string }) => filterCommands(query),
        command: ({ editor, range, props }: { editor: Editor; range: { from: number; to: number }; props: SlashCommandItem }) => {
          props.command({ editor, range });
        },
        render: () => {
          let component: SolidRenderer<SlashCommandListProps> | null = null;
          let unmount: (() => void) | null = null;
          let selectedIndex = 0;
          let currentItems: SlashCommandItem[] = [];
          let runCommand: ((item: SlashCommandItem) => void) | null = null;

          const syncList = () => {
            component?.updateProps({
              items: currentItems,
              selectedIndex,
              command: (item) => runCommand?.(item),
              onHover: (index) => {
                selectedIndex = index;
                component?.updateProps({ selectedIndex });
              },
            });
          };

          const destroyList = () => {
            unmount?.();
            unmount = null;
            component?.destroy();
            component = null;
            currentItems = [];
            runCommand = null;
            selectedIndex = 0;
          };

          const mountList = (props: SuggestionProps<SlashCommandItem, SlashCommandItem>) => {
            destroyList();
            selectedIndex = 0;
            currentItems = props.items;
            runCommand = props.command;

            component = new SolidRenderer(SlashCommandList, {
              editor: props.editor,
              props: {
                items: currentItems,
                selectedIndex,
                command: (item) => runCommand?.(item),
                onHover: (index) => {
                  selectedIndex = index;
                  component?.updateProps({ selectedIndex });
                },
              },
            });
            unmount = props.mount(component.element);
          };

          return {
            onStart(props: SuggestionProps<SlashCommandItem, SlashCommandItem>) {
              if (!props.items.length) return;
              mountList(props);
            },

            onUpdate(props: SuggestionProps<SlashCommandItem, SlashCommandItem>) {
              if (!props.items.length) {
                destroyList();
                return;
              }

              currentItems = props.items;
              runCommand = props.command;
              selectedIndex = Math.min(selectedIndex, currentItems.length - 1);

              if (!component) {
                mountList(props);
                return;
              }

              syncList();
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === 'Escape') {
                exitSuggestion(props.view, SlashCommandsPluginKey);
                return true;
              }

              if (!component || currentItems.length === 0) {
                return false;
              }

              if (props.event.key === 'ArrowUp') {
                props.event.preventDefault();
                selectedIndex = (selectedIndex + currentItems.length - 1) % currentItems.length;
                syncList();
                return true;
              }

              if (props.event.key === 'ArrowDown') {
                props.event.preventDefault();
                selectedIndex = (selectedIndex + 1) % currentItems.length;
                syncList();
                return true;
              }

              if (props.event.key === 'Enter') {
                props.event.preventDefault();
                const item = currentItems[selectedIndex];
                if (item) runCommand?.(item);
                return true;
              }

              return false;
            },

            onExit() {
              destroyList();
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
