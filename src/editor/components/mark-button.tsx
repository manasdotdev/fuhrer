import type { Component } from 'solid-js';

import { useEditorIsActive } from '../bridge/create-editor-store';
import { useEditor } from '../bridge/editor-context';

import styles from '../styles/bubble-menu.module.css';

type MarkType = 'bold' | 'italic' | 'strike' | 'code' | 'underline';

const labels: Record<MarkType, string> = {
  bold: 'B',
  italic: 'I',
  strike: 'S',
  code: '</>',
  underline: 'U',
};

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
      data-mark={props.type}
      class={`${styles.button}${props.class ? ` ${props.class}` : ''}`}
      classList={{ [styles.buttonActive]: !!active() }}
      disabled={!editor()}
      aria-label={props.type}
      aria-pressed={!!active()}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        const ed = editor();
        if (!ed) return;
        commands[props.type](ed);
      }}>
      {labels[props.type]}
    </button>
  );
};
