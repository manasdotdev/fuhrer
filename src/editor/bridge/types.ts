import type { Editor, EditorOptions as TiptapEditorOptions } from '@tiptap/core';

/** Options callers may pass — the bridge owns `element`. */
export type CreateEditorOptions = Omit<Partial<TiptapEditorOptions>, 'element'>;

export type EditorAccessor = () => Editor | undefined;
