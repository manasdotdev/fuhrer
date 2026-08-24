import Image from '@tiptap/extension-image';

import { asDraggableBlock } from '../features/node-block';

export const CustomImage = asDraggableBlock(Image, {
  allowBase64: true,
  resize: {
    enabled: true,
    alwaysPreserveAspectRatio: true,
  },
});
