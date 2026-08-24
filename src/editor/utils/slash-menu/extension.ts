import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { Suggestion, type SuggestionOptions } from '@tiptap/suggestion';

import type { SlashItem } from './items';
import { slashSuggestion } from './suggestion';

export const SlashCommandsPluginKey = new PluginKey('slashCommands');

type SlashSuggestionOptions = Omit<SuggestionOptions<SlashItem, SlashItem>, 'editor'>;

export const SlashCommands = Extension.create<{ suggestion: Partial<SlashSuggestionOptions> }>({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        pluginKey: SlashCommandsPluginKey,
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        ...slashSuggestion,
      } satisfies SlashSuggestionOptions,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashItem, SlashItem>({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
