import type { Editor } from '@tiptap/core';
import { createContext, useContext, type Accessor, type ParentComponent } from 'solid-js';

const EditorCtx = createContext<Accessor<Editor | undefined>>();

export const EditorProvider: ParentComponent<{
  editor: Accessor<Editor | undefined>;
}> = (props) => <EditorCtx.Provider value={props.editor}>{props.children}</EditorCtx.Provider>;

export function useEditor() {
  const editor = useContext(EditorCtx);
  if (!editor) throw new Error('useEditor must be used under EditorProvider');
  return editor;
}
