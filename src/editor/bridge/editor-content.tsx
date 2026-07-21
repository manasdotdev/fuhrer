import { createSignal, type ParentComponent } from 'solid-js';

import { createEditor } from './create-editor';
import { EditorProvider } from './editor-context';
import type { CreateEditorOptions } from './types';

import styles from '../styles/editor.module.css';

export const EditorContent: ParentComponent<{
  options: CreateEditorOptions;
  class?: string;
}> = (props) => {
  const [el, setEl] = createSignal<HTMLDivElement>();

  const editor = createEditor(el, () => props.options);

  return (
    <EditorProvider editor={editor}>
      {props.children}
      <div ref={setEl} class={`${styles.root}${props.class ? ` ${props.class}` : ''}`} />
    </EditorProvider>
  );
};
