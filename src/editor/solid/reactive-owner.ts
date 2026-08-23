import type { Editor } from '@tiptap/core';
import type { Owner } from 'solid-js';

/**
 * Solid contexts resolve through the reactive owner tree.
 * TipTap node views / extension hooks run outside that tree, so we
 * stash the owner that created (or mounted) the editor for later
 * `createRoot(..., owner)` / `runWithOwner` use.
 */
export const EDITOR_REACTIVE_OWNER = Symbol('tiptap-solid.reactiveOwner');

type EditorWithOwner = Editor & {
  [EDITOR_REACTIVE_OWNER]?: Owner | null;
};

export function setEditorReactiveOwner(editor: Editor, owner: Owner | null | undefined): void {
  (editor as EditorWithOwner)[EDITOR_REACTIVE_OWNER] = owner ?? null;
}

export function getEditorReactiveOwner(editor: Editor): Owner | null | undefined {
  return (editor as EditorWithOwner)[EDITOR_REACTIVE_OWNER];
}
