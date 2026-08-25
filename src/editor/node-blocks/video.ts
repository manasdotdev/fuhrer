import { Node, mergeAttributes, type CommandProps } from '@tiptap/core';

import { VideoUploadView } from '../components/video-upload';
import { SolidNodeViewRenderer } from '../solid-bindings';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      insertVideo: () => ReturnType;
      setVideo: (attrs: { src: string; caption?: string; alt?: string }) => ReturnType;
    };
  }
}

export const VideoNode = Node.create({
  name: 'video',
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
    return [{ tag: 'div[data-type="video"]' }, { tag: 'video[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'video' })];
  },

  addCommands() {
    return {
      insertVideo:
        () =>
        ({ commands }: CommandProps) =>
          commands.insertContent({ type: this.name }),
      setVideo:
        (attrs) =>
        ({ commands }: CommandProps) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              src: attrs.src,
              caption: attrs.caption ?? '',
              alt: attrs.alt ?? '',
            },
          }),
    };
  },

  addNodeView() {
    return SolidNodeViewRenderer(VideoUploadView);
  },
});
