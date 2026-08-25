import { Node, mergeAttributes, type CommandProps } from '@tiptap/core';

import { ImageUploadView } from '../components/image-upload';
import { SolidNodeViewRenderer } from '../solid-bindings';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageUpload: {
      insertImageUpload: () => ReturnType;
    };
  }
}

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
