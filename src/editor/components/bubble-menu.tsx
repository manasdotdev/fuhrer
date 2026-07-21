import type { Editor } from '@tiptap/core';
import type { PluginKey } from '@tiptap/pm/state';
import { createSignal, onCleanup, createEffect, type ParentComponent } from 'solid-js';

import { useEditor } from '../bridge/editor-context';
import { BubbleMenuPlugin } from '../plugins/bubble-menu-plugin';
import type { BubbleMenuPluginProps } from '../plugins/bubble-menu-plugin';

type Props = Omit<BubbleMenuPluginProps, 'editor' | 'element' | 'pluginKey'> & {
  editor?: Editor | null;
  class?: string;
  pluginKey?: PluginKey | string;
};

const DEFAULT_PLUGIN_KEY = 'bubbleMenu';

export const BubbleMenu: ParentComponent<Props> = (props) => {
  const contextEditor = useEditor();
  const [el, setEl] = createSignal<HTMLDivElement>();

  createEffect(() => {
    const editor = props.editor ?? contextEditor();
    const element = el();
    if (!editor || editor.isDestroyed || !element) return;

    const pluginKey = props.pluginKey ?? DEFAULT_PLUGIN_KEY;

    editor.registerPlugin(
      BubbleMenuPlugin({
        pluginKey,
        editor,
        element,
        updateDelay: props.updateDelay,
        resizeDelay: props.resizeDelay,
        appendTo: props.appendTo,
        shouldShow: props.shouldShow,
        options: props.options,
        getReferencedVirtualElement: props.getReferencedVirtualElement,
        lockPosition: props.lockPosition,
      }),
    );

    onCleanup(() => {
      editor.unregisterPlugin(pluginKey);
    });
  });

  return (
    <div ref={setEl} class={props.class} style={{ visibility: 'hidden', position: 'absolute' }}>
      {props.children}
    </div>
  );
};
