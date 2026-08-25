import Image from '@tiptap/extension-image';

import styles from '../styles/image.module.css';

export const ImageNode = Image.extend({ draggable: true }).configure({
  HTMLAttributes: {
    class: `${styles.image_node}`,
  },
  allowBase64: true,
});
