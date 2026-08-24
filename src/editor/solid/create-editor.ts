import { Editor, type EditorOptions, type Extensions } from '@tiptap/core';
import { type Accessor, createEffect, createSignal, getOwner, on, onCleanup } from 'solid-js';

import { setEditorReactiveOwner } from './reactive-owner';

/**
 * Editor options managed by the Solid binding.
 * `element` is owned by `EditorContent`.
 *
 * `content` is initial content only — update later with
 * `editor.commands.setContent(...)`.
 */
export type CreateEditorOptions = Omit<Partial<EditorOptions>, 'element'>;

export type CreateEditorConfig = {
  /**
   * Extra values that force editor recreation when they change.
   * Use when the schema must change but extension array identity does not.
   */
  deps?: Accessor<readonly unknown[]>;
};

function extensionsEqual(a?: Extensions, b?: Extensions): boolean {
  if (a === b) {
    return true;
  }

  if (!a || !b || a.length !== b.length) {
    return false;
  }

  return a.every((extension, index) => extension === b[index]);
}

function depsEqual(a: readonly unknown[] | undefined, b: readonly unknown[] | undefined): boolean {
  if (a === b) {
    return true;
  }

  if (!a || !b || a.length !== b.length) {
    return false;
  }

  return a.every((dep, index) => Object.is(dep, b[index]));
}

function omitUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as Partial<T>;
}

/**
 * Create a TipTap `Editor` bound to the current Solid reactive owner.
 *
 * Uses TipTap's default detached `element` so the ProseMirror view exists
 * immediately; `EditorContent` then adopts that DOM into the Solid tree.
 *
 * - Instance identity is stable across transactions (no force-updates).
 * - Recreates when `extensions` identity changes, or when `deps` change.
 * - Syncs `editable` without recreating the editor.
 * - Omits `undefined` option keys so TipTap defaults (e.g. `editable: true`) stay intact.
 *
 * @see https://tiptap.dev/docs/editor/api/editor
 */
export function createEditor(options: Accessor<CreateEditorOptions>, config: CreateEditorConfig = {}): Accessor<Editor | undefined> {
  const [editor, setEditor] = createSignal<Editor | undefined>(undefined);
  const owner = getOwner();

  const getLatestOptions = (): CreateEditorOptions => omitUndefined(options() as Record<string, unknown>) as CreateEditorOptions;

  const createInstance = (): Editor => {
    const latest = getLatestOptions();

    // TipTap defaults `element` to `document.createElement('div')` and mounts
    // into that detached node. EditorContent relocates the view into the page.
    const instance = new Editor({
      ...latest,
      // Always invoke the most recent user callbacks (TipTap React pattern).
      onBeforeCreate: (props) => getLatestOptions().onBeforeCreate?.(props),
      onCreate: (props) => getLatestOptions().onCreate?.(props),
      onMount: (props) => getLatestOptions().onMount?.(props),
      onUnmount: (props) => getLatestOptions().onUnmount?.(props),
      onUpdate: (props) => getLatestOptions().onUpdate?.(props),
      onSelectionUpdate: (props) => getLatestOptions().onSelectionUpdate?.(props),
      onTransaction: (props) => getLatestOptions().onTransaction?.(props),
      onFocus: (props) => getLatestOptions().onFocus?.(props),
      onBlur: (props) => getLatestOptions().onBlur?.(props),
      onDestroy: (props) => getLatestOptions().onDestroy?.(props),
      onContentError: (props) => getLatestOptions().onContentError?.(props),
      onDrop: (...args) => getLatestOptions().onDrop?.(...args),
      onPaste: (...args) => getLatestOptions().onPaste?.(...args),
      onDelete: (props) => getLatestOptions().onDelete?.(props),
    });

    setEditorReactiveOwner(instance, owner);
    return instance;
  };

  // Recreate only when schema-relevant inputs change.
  createEffect(
    on(
      () => ({
        extensions: options().extensions,
        deps: config.deps?.(),
      }),
      (next, prev) => {
        if (prev && extensionsEqual(prev.extensions, next.extensions) && depsEqual(prev.deps, next.deps)) {
          return;
        }

        const previous = editor();
        if (previous && !previous.isDestroyed) {
          previous.destroy();
        }

        const instance = createInstance();
        setEditor(instance);

        onCleanup(() => {
          if (!instance.isDestroyed) {
            instance.destroy();
          }
          if (editor() === instance) {
            setEditor(undefined);
          }
        });
      },
      { defer: false },
    ),
  );

  // Editable is safe to patch without tearing down the view.
  createEffect(() => {
    const instance = editor();
    const editable = options().editable;

    if (!instance || instance.isDestroyed || editable === undefined || editable === instance.isEditable) {
      return;
    }

    instance.setEditable(editable, false);
  });

  onCleanup(() => {
    const instance = editor();
    if (instance && !instance.isDestroyed) {
      instance.destroy();
    }
  });

  return editor;
}
