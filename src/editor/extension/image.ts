import Image from '@tiptap/extension-image';

import { asDraggableBlock } from '../block';

export const CustomImage = asDraggableBlock(Image, {
  resize: {
    enabled: true,
    alwaysPreserveAspectRatio: true,
  },
});
