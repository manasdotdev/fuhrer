import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom';
import { SlashMenuKey, SlashMetaTypes, dispatchWithMeta, type CommandItem, type MenuElement, type SlashMenuState } from 'prosemirror-slash-menu';
import type { EditorView } from 'prosemirror-view';
import { For, Show, createEffect, createMemo, createSignal, onCleanup, type Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { useEditor } from '../bridge/editor-context';
import { BlockquoteIcon, BulletListIcon, CodeIcon, DividerIcon, Heading2Icon, Heading3Icon, OrderedListIcon, TextIcon } from '../styles/icons';

import styles from '../styles/slash-menu.module.css';

type Group = { label: string; items: MenuElement[] };

const ITEM_ICONS: Record<string, Component> = {
  paragraph: TextIcon,
  heading2: Heading2Icon,
  heading3: Heading3Icon,
  bulletList: BulletListIcon,
  orderedList: OrderedListIcon,
  blockquote: BlockquoteIcon,
  codeBlock: CodeIcon,
  horizontalRule: DividerIcon,
};

function groupItems(items: MenuElement[]): Group[] {
  const order: string[] = [];
  const map = new Map<string, MenuElement[]>();

  for (const item of items) {
    const label = item.group ?? 'Commands';
    if (!map.has(label)) {
      map.set(label, []);
      order.push(label);
    }
    map.get(label)!.push(item);
  }

  return order.map((label) => ({ label, items: map.get(label)! }));
}

/** Anchor to the ProseMirror caret — never the full editor box. */
function caretVirtualElement(view: EditorView) {
  return {
    getBoundingClientRect: () => {
      const { from, to, empty } = view.state.selection;
      const start = view.coordsAtPos(from);
      const end = empty ? start : view.coordsAtPos(to);
      const top = Math.min(start.top, end.top);
      const bottom = Math.max(start.bottom, end.bottom);
      const left = Math.min(start.left, end.left);
      const right = Math.max(start.right, end.right);
      return new DOMRect(left, top, Math.max(right - left, 1), Math.max(bottom - top, 1));
    },
    contextElement: view.dom,
  };
}

/**
 * Solid UI for headless `prosemirror-slash-menu`.
 * Mount under `EditorContent` alongside BubbleMenu / LinkToolbar.
 */
export const SlashMenu: Component = () => {
  const editor = useEditor();
  const [menuState, setMenuState] = createSignal<SlashMenuState | null>(null);
  const [floatEl, setFloatEl] = createSignal<HTMLDivElement>();
  const [ready, setReady] = createSignal(false);

  const open = createMemo(() => !!menuState()?.open);
  const groups = createMemo(() => groupItems(menuState()?.filteredElements ?? []));
  const selectedId = createMemo(() => menuState()?.selected);

  createEffect(() => {
    const ed = editor();
    if (!ed) {
      setMenuState(null);
      return;
    }

    const sync = () => {
      setMenuState(SlashMenuKey.getState(ed.state) ?? null);
    };

    sync();
    ed.on('transaction', sync);
    onCleanup(() => ed.off('transaction', sync));
  });

  createEffect(() => {
    const ed = editor();
    const el = floatEl();
    const isOpen = open();
    if (!ed || !el || !isOpen) {
      setReady(false);
      return;
    }

    const reference = caretVirtualElement(ed.view);

    const update = () => {
      void computePosition(reference, el, {
        strategy: 'fixed',
        placement: 'bottom-start',
        middleware: [
          offset(6),
          flip({
            fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
            padding: 8,
          }),
          shift({ padding: 8 }),
          size({
            padding: 8,
            apply({ availableHeight, elements }) {
              // Prefer fitting the full default list; only clamp when the viewport is short.
              Object.assign(elements.floating.style, {
                maxHeight: `${Math.min(380, Math.max(160, availableHeight))}px`,
              });
            },
          }),
        ],
      }).then(({ x, y }) => {
        if (!floatEl()) return;
        Object.assign(el.style, {
          position: 'fixed',
          left: `${Math.round(x)}px`,
          top: `${Math.round(y)}px`,
        });
        setReady(true);
      });
    };

    const stop = autoUpdate(reference, el, update, {
      ancestorScroll: true,
      ancestorResize: true,
      elementResize: true,
      layoutShift: true,
      animationFrame: true,
    });

    onCleanup(() => {
      stop();
      setReady(false);
    });
  });

  // Keep the keyboard-highlighted row in view while filtering / arrowing.
  createEffect(() => {
    const id = selectedId();
    const el = floatEl();
    if (!id || !el || !ready()) return;
    const option = el.querySelector<HTMLElement>(`[data-item-id="${CSS.escape(String(id))}"]`);
    option?.scrollIntoView({ block: 'nearest' });
  });

  const executeItem = (item: MenuElement) => {
    const ed = editor();
    if (!ed) return;

    if (item.type === 'command') {
      (item as CommandItem).command(ed.view);
      dispatchWithMeta(ed.view, SlashMenuKey, { type: SlashMetaTypes.execute });
      return;
    }

    dispatchWithMeta(ed.view, SlashMenuKey, {
      type: SlashMetaTypes.openSubMenu,
      element: item,
    });
  };

  return (
    <Show when={open()}>
      <div
        ref={setFloatEl}
        class={styles.menu}
        role='listbox'
        aria-label='Slash commands'
        aria-hidden={!ready()}
        style={{
          position: 'fixed',
          top: '0px',
          left: '0px',
          'z-index': '10000',
          visibility: ready() ? 'visible' : 'hidden',
          'pointer-events': ready() ? 'auto' : 'none',
        }}>
        <Show when={groups().length > 0} fallback={<p class={styles.empty}>No matching commands</p>}>
          <For each={groups()}>
            {(group) => (
              <div class={styles.group}>
                <div class={styles.groupLabel}>{group.label}</div>
                <For each={group.items}>
                  {(item) => (
                    <button
                      type='button'
                      role='option'
                      data-item-id={item.id}
                      class={styles.item}
                      classList={{ [styles.itemSelected]: selectedId() === item.id }}
                      aria-selected={selectedId() === item.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => executeItem(item)}>
                      <span class={styles.itemIcon} aria-hidden='true'>
                        {ITEM_ICONS[item.id] ? <Dynamic component={ITEM_ICONS[item.id]} /> : <span class={styles.itemIconFallback} />}
                      </span>
                      <span class={styles.itemLabel}>{item.label}</span>
                    </button>
                  )}
                </For>
              </div>
            )}
          </For>
        </Show>
      </div>
    </Show>
  );
};
