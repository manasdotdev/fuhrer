import HorizontalRule from '@tiptap/extension-horizontal-rule';

import { asDraggableBlock } from '../utils/node-block';

export const CustomHorizontalRule = asDraggableBlock(HorizontalRule, {
  HTMLAttributes: {
    class: 'divider',
  },
});
