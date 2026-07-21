import type { Component } from 'solid-js';

import { useEditorIsActive } from '../bridge/create-editor-store';
import { useEditor } from '../bridge/editor-context';

const TOGGLE: Record<string, () => void> = {};

type MarkType = 'bold' | 'italic' | 'strike' | 'code' | 'underline';

const commands: Record<MarkType, (editor: NonNullable<ReturnType<ReturnType<typeof useEditor>>>) => void> = {
  bold: (ed) => ed.chain().focus().toggleBold().run(),
  italic: (ed) => ed.chain().focus().toggleItalic().run(),
  strike: (ed) => ed.chain().focus().toggleStrike().run(),
  code: (ed) => ed.chain().focus().toggleCode().run(),
  underline: (ed) => ed.chain().focus().toggleUnderline().run(),
};

export const MarkButton: Component<{ type: MarkType; class?: string }> = (props) => {
  const editor = useEditor();
  const active = useEditorIsActive(editor, props.type);

  return (
    <button
      type='button'
      class={props.class}
      classList={{ active: !!active() }}
      disabled={!editor()}
      aria-pressed={!!active()}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        const ed = editor();
        if (!ed) return;
        commands[props.type](ed);
      }}>
      {props.type}
    </button>
  );
};
