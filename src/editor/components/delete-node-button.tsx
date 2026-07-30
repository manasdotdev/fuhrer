import type { Component } from 'solid-js';
import { NodeSelection } from '@tiptap/pm/state';

import { useEditor } from '../bridge/editor-context';
import { TrashIcon } from '../styles/icons';

import styles from '../styles/bubble-menu.module.css';

export const DeleteNodeButton: Component<{ class?: string }> = (props) => {
  const editor = useEditor();

  return (
    <div class={styles.item}>
      <button
        type='button'
        class={`${styles.button}${props.class ? ` ${props.class}` : ''}`}
        disabled={!editor()}
        aria-label='Delete'
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const ed = editor();
          if (!ed) return;
          const { selection } = ed.state;
          if (selection instanceof NodeSelection) {
            ed.chain().focus().deleteSelection().run();
            return;
          }
          if (ed.isActive('codeBlock')) {
            ed.chain().focus().deleteNode('codeBlock').run();
          }
        }}>
        <TrashIcon />
      </button>
      <div class={styles.tooltip} role='tooltip'>
        <span>Delete</span>
      </div>
    </div>
  );
};
