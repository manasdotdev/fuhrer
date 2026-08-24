import type { Component, JSX } from 'solid-js';

import { FuhrerKit } from '../kits/fuhrer-kit';
import { createEditor, EditorContent, EditorProvider, type CreateEditorOptions } from '../solid';

import '../styles/editor.css';

export type DefaultEditorProps = {
  class?: string;
  content?: CreateEditorOptions['content'];
  editable?: boolean;
  autofocus?: CreateEditorOptions['autofocus'];
  /** Override the default FuhrerKit extension list entirely. */
  extensions?: CreateEditorOptions['extensions'];
  onUpdate?: CreateEditorOptions['onUpdate'];
  children?: JSX.Element;
};

/**
 * Plug-and-play editor shell — TipTap SimpleEditor / template pattern.
 * Uses FuhrerKit by default; pass `extensions` to fully override.
 *
 * @see https://tiptap.dev/docs/ui-components/templates/simple-editor
 */
export const DefaultEditor: Component<DefaultEditorProps> = (props) => {
  const editor = createEditor(() => ({
    extensions: props.extensions ?? [FuhrerKit],
    content: props.content,
    // Only forward when set — `undefined` would override TipTap's default `editable: true`.
    ...(props.editable !== undefined ? { editable: props.editable } : {}),
    autofocus: props.autofocus ?? 'start',
    onUpdate: props.onUpdate,
  }));

  return (
    <EditorProvider editor={editor}>
      {props.children}
      <EditorContent class={props.class ?? 'mx-auto mt-[20vh] max-w-[748px] rounded-md border border-gray-200 p-2'} />
    </EditorProvider>
  );
};

export default DefaultEditor;
