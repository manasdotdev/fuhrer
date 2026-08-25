import HorizontalRule from '@tiptap/extension-horizontal-rule';

import styles from '../styles/divider.module.css';

export const DividerNode = HorizontalRule.extend({ draggable: true }).configure({
  HTMLAttributes: {
    class: `${styles.divider_node}`,
  },
});
