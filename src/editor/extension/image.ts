import Image from '@tiptap/extension-image';

import { asDraggableBlock } from '../utils/node-block';

export const CustomImage = asDraggableBlock(Image, {
  allowBase64: true,
  resize: {
    enabled: true,
    alwaysPreserveAspectRatio: true,
  },
});
