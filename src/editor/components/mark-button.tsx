import { For, Show, type Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { useEditorIsActive } from '../bridge/create-editor-store';
import { useEditor } from '../bridge/editor-context';
import { BoldIcon, ItalicIcon, Heading3Icon, Heading2Icon, BlockquoteIcon, LinkIcon, SnippetIcon } from '../styles/icons';

import styles from '../styles/bubble-menu.module.css';

export type MarkType = 'bold' | 'italic' | 'heading2' | 'heading3' | 'quote' | 'link' | 'snippet';

const icons: Record<MarkType, Component> = {
  bold: BoldIcon,
  italic: ItalicIcon,
  heading2: Heading2Icon,
  heading3: Heading3Icon,
  quote: BlockquoteIcon,
  link: LinkIcon,
  snippet: SnippetIcon,
};

const labels: Record<MarkType, string> = {
  bold: 'Bold',
  italic: 'Emphasize',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  quote: 'Quote',
  link: 'Link',
  snippet: 'Save as snippet',
};

const shortcuts: Partial<Record<MarkType, string[]>> = {
  bold: ['Ctrl', 'B'],
  italic: ['Ctrl', 'I'],
  heading2: ['Ctrl', 'Alt', '2'],
  heading3: ['Ctrl', 'Alt', '3'],
  quote: ['Ctrl', 'Q'],
  link: ['Ctrl', 'K'],
};

type EditorInstance = NonNullable<ReturnType<ReturnType<typeof useEditor>>>;

const commands: Record<MarkType, (editor: EditorInstance) => void> = {
  bold: (ed) => ed.chain().focus().toggleBold().run(),
  italic: (ed) => ed.chain().focus().toggleItalic().run(),
  heading2: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
  heading3: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
  quote: (ed) => ed.chain().focus().toggleBlockquote().run(),
  link: () => {},
  snippet: () => {},
};

const activeAttrs: Partial<Record<MarkType, Record<string, unknown>>> = {
  heading2: { level: 2 },
  heading3: { level: 3 },
};

const activeName: Record<MarkType, string> = {
  bold: 'bold',
  italic: 'italic',
  heading2: 'heading',
  heading3: 'heading',
  quote: 'blockquote',
  link: 'link',
  snippet: 'snippet',
};

export const MarkButton: Component<{ type: MarkType; class?: string }> = (props) => {
  const editor = useEditor();
  const active = useEditorIsActive(editor, activeName[props.type], activeAttrs[props.type]);

  return (
    <div class={styles.item}>
      <button
        type='button'
        data-mark={props.type}
        class={`${styles.button}${props.class ? ` ${props.class}` : ''}`}
        classList={{ [styles.buttonActive]: !!active() }}
        disabled={!editor()}
        aria-label={labels[props.type]}
        aria-pressed={!!active()}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const ed = editor();
          if (!ed) return;
          commands[props.type](ed);
        }}>
        <Dynamic component={icons[props.type]} />
      </button>
      <div class={styles.tooltip} role='tooltip'>
        <span>{labels[props.type]}</span>
        <Show when={shortcuts[props.type]}>{(keys) => <For each={keys()}>{(key) => <span class={styles.kbd}>{key}</span>}</For>}</Show>
      </div>
    </div>
  );
};

export const MenuDivider: Component = () => <div class={styles.divider} aria-hidden='true' />;
