import HorizontalRule from '@tiptap/extension-horizontal-rule';

import { asDraggableBlock } from '../features/node-block';

export const CustomHorizontalRule = asDraggableBlock(HorizontalRule, {
  HTMLAttributes: {
    class: 'divider',
  },
});
