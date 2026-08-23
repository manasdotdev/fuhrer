import type { Editor } from '@tiptap/core';
import { type Accessor, createEffect, createSignal, onCleanup } from 'solid-js';

import { structuralEquals } from './equals';

export type EditorStateSnapshot<TEditor extends Editor | null | undefined = Editor | undefined> = {
  editor: TEditor;
  transactionNumber: number;
};

export type EditorStateEvent = 'transaction' | 'update' | 'selectionUpdate';

export type CreateEditorStateOptions<TSelected, TEditor extends Editor | null | undefined = Editor | undefined> = {
  /**
   * Editor instance, or an accessor that returns it (from `createEditor`).
   */
  editor: TEditor | Accessor<TEditor>;
  /**
   * Derive the slice of editor state this consumer cares about.
   * Only changes to this value (per `equals`) notify subscribers.
   *
   * @see https://tiptap.dev/docs/guides/performance
   */
  selector: (snapshot: EditorStateSnapshot<TEditor>) => TSelected;
  /**
   * Equality check for selector output. Defaults to structural equality.
   */
  equals?: (a: TSelected, b: TSelected) => boolean;
  /**
   * TipTap events that invalidate the selector.
   * Defaults to `transaction` + `update` (matches `@tiptap/react` useEditorState).
   */
  events?: readonly EditorStateEvent[];
};

function resolveEditor<TEditor extends Editor | null | undefined>(editor: TEditor | Accessor<TEditor>): TEditor {
  return typeof editor === 'function' ? (editor as Accessor<TEditor>)() : editor;
}

/**
 * Subscribe to TipTap transactions and expose a fine-grained Solid signal.
 *
 * Prefer this over reading `editor()` in templates for toolbar / menu UI —
 * the editor instance stays referentially stable; only your selected slice updates.
 *
 * @example
 * ```ts
 * const isBold = createEditorState({
 *   editor,
 *   selector: ({ editor }) => editor?.isActive('bold') ?? false,
 * })
 * ```
 */
export function createEditorState<TSelected, TEditor extends Editor | null | undefined = Editor | undefined>(
  options: CreateEditorStateOptions<TSelected, TEditor>,
): Accessor<TSelected> {
  const equals = options.equals ?? structuralEquals;
  const events = options.events ?? (['transaction', 'update'] as const);

  const readSnapshot = (transactionNumber: number): EditorStateSnapshot<TEditor> => ({
    editor: resolveEditor(options.editor),
    transactionNumber,
  });

  const [selected, setSelected] = createSignal<TSelected>(options.selector(readSnapshot(0)), { equals });

  createEffect(() => {
    const instance = resolveEditor(options.editor);
    let transactionNumber = 0;
    let lastTransaction: unknown;

    const notify = (props?: { transaction?: unknown }) => {
      if (props?.transaction !== undefined && props.transaction === lastTransaction) {
        return;
      }

      if (props?.transaction !== undefined) {
        lastTransaction = props.transaction;
      }

      transactionNumber += 1;
      const next = options.selector(readSnapshot(transactionNumber) as EditorStateSnapshot<TEditor>);
      setSelected(() => next);
    };

    // Re-run selector when the editor instance itself is swapped.
    notify();

    if (!instance || instance.isDestroyed) {
      return;
    }

    for (const event of events) {
      instance.on(event, notify);
    }

    onCleanup(() => {
      for (const event of events) {
        instance.off(event, notify);
      }
    });
  });

  return selected;
}

/**
 * Lightweight helper: re-read a value after every editor transaction.
 * Equivalent to LXSMNSYC `createEditorTransaction`, built on `createEditorState`.
 */
export function createEditorTransaction<T>(
  editor: Accessor<Editor | undefined | null>,
  read: (editor: Editor | undefined | null) => T,
  equals: (a: T, b: T) => boolean = structuralEquals,
): Accessor<T> {
  return createEditorState({
    editor,
    selector: ({ editor: current }) => read(current),
    equals,
    events: ['transaction'],
  });
}
