import { isTextSelection } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import type { EditorState } from '@tiptap/pm/state';
import { NodeSelection } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

/** Block types that use the card bubble menu (not the text formatting menu). */
export const CARD_BUBBLE_NODES = ['image', 'video', 'audio', 'embed', 'codeBlock', 'horizontalRule'] as const;

export type CardBubbleNode = (typeof CARD_BUBBLE_NODES)[number];

const CARD_NODE_SET = new Set<string>(CARD_BUBBLE_NODES);

type ShouldShowArgs = {
  editor: Editor;
  element: HTMLElement;
  view: EditorView;
  state: EditorState;
  from: number;
  to: number;
};

function hasMenuOrEditorFocus(view: EditorView, element: HTMLElement) {
  return view.hasFocus() || element.contains(document.activeElement);
}

export function isCardNodeSelection(selection: EditorState['selection']): selection is NodeSelection {
  return selection instanceof NodeSelection && CARD_NODE_SET.has(selection.node.type.name);
}

/** Text marks / headings — hide on card node selections and inside code blocks. */
export function shouldShowTextBubbleMenu({ editor, element, view, state, from, to }: ShouldShowArgs): boolean {
  const { doc, selection } = state;

  if (!editor.isEditable || isCardNodeSelection(selection) || editor.isActive('codeBlock')) {
    return false;
  }

  const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(selection);

  if (!hasMenuOrEditorFocus(view, element) || selection.empty || isEmptyTextBlock) {
    return false;
  }

  return true;
}

/** Delete / card actions — node selection, or cursor inside a code block. */
export function shouldShowCardBubbleMenu({ editor, element, view, state }: ShouldShowArgs): boolean {
  if (!editor.isEditable || !hasMenuOrEditorFocus(view, element)) {
    return false;
  }

  if (isCardNodeSelection(state.selection)) {
    return true;
  }

  // Code blocks aren't atoms — show while the caret is inside one.
  return editor.isActive('codeBlock') && state.selection.empty;
}
