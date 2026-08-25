import { Node, mergeAttributes, type CommandProps } from '@tiptap/core';
import Image from '@tiptap/extension-image';

import { ImageUploadView } from '../components/image-upload';
import { SolidNodeViewRenderer } from '../solid-bindings';

import styles from '../styles/image.module.css';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageUpload: {
      insertImageUpload: () => ReturnType;
    };
  }
}

export const ImageNode = Image.extend({ draggable: true }).configure({
  HTMLAttributes: {
    class: `${styles.image_node}`,
  },
  allowBase64: true,
});

export const ImageUploadNode = Node.create({
  name: 'imageUpload',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      caption: { default: '' },
      alt: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-upload"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'image-upload' })];
  },

  addCommands() {
    return {
      insertImageUpload:
        () =>
        ({ commands }: CommandProps) =>
          commands.insertContent({ type: this.name }),
    };
  },

  addNodeView() {
    return SolidNodeViewRenderer(ImageUploadView);
  },
});
