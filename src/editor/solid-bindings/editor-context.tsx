import type { Editor } from '@tiptap/core';
import { type Accessor, type JSX, type ParentComponent, createContext, useContext } from 'solid-js';

export type EditorContextValue = {
  /**
   * Reactive accessor for the current editor instance.
   */
  editor: Accessor<Editor | undefined>;
};

const EditorContext = createContext<EditorContextValue>();

export type EditorProviderProps = {
  /**
   * Editor instance accessor from `createEditor`, or a plain instance.
   */
  editor: Accessor<Editor | undefined> | Editor | undefined | null;
  children: JSX.Element;
};

function resolveEditorAccessor(editor: EditorProviderProps['editor']): Accessor<Editor | undefined> {
  if (typeof editor === 'function') {
    return editor as Accessor<Editor | undefined>;
  }

  return () => editor ?? undefined;
}

/**
 * Provides the TipTap editor to descendants via context.
 *
 * @example
 * ```tsx
 * const editor = createEditor(() => ({ extensions: [StarterKit] }))
 *
 * <EditorProvider editor={editor}>
 *   <Toolbar />
 *   <EditorContent />
 * </editorprovider>
 * ```
 */
export const EditorProvider: ParentComponent<EditorProviderProps> = (props) => {
  const value: EditorContextValue = {
    editor: () => resolveEditorAccessor(props.editor)(),
  };

  return <EditorContext.Provider value={value}>{props.children}</EditorContext.Provider>;
};

/**
 * Read the editor from the nearest `EditorProvider`.
 * Throws if used outside a provider.
 */
export function useEditorContext(): Accessor<Editor | undefined> {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error('useEditorContext must be used within an <EditorProvider>');
  }

  return context.editor;
}

/**
 * Read the editor from context when available; otherwise `undefined`.
 */
export function useOptionalEditorContext(): Accessor<Editor | undefined> | undefined {
  return useContext(EditorContext)?.editor;
}

/**
 * Alias matching TipTap React's `useCurrentEditor` naming.
 */
export function useCurrentEditor(): Accessor<Editor | undefined> {
  return useEditorContext();
}
