import { autoUpdate, computePosition, inline, offset, shift } from '@floating-ui/dom';
import { getMarkRange } from '@tiptap/core';
import { createContext, createEffect, createSignal, onCleanup, Show, useContext, type ParentComponent } from 'solid-js';

import { useEditor } from '../bridge/editor-context';
import { normalizeUrl } from '../utils/is-valid-url';
import { LinkEditable } from './link-editable';

type AnchorRect = {
  getBoundingClientRect: () => DOMRect;
  getClientRects?: () => DOMRectList | DOMRect[];
  contextElement?: Element;
};

type LinkToolbarApi = {
  openEdit: (url?: string) => void;
};

const LinkToolbarCtx = createContext<LinkToolbarApi>();

export function useLinkToolbar() {
  const api = useContext(LinkToolbarCtx);
  if (!api) throw new Error('useLinkToolbar must be used under LinkToolbar');
  return api;
}

function selectionVirtualElement(contextElement?: Element | null): AnchorRect | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  return {
    getBoundingClientRect: () => range.getBoundingClientRect(),
    getClientRects: () => range.getClientRects(),
    contextElement: contextElement ?? range.commonAncestorContainer.parentElement ?? undefined,
  };
}

function linkVirtualElement(anchor: HTMLElement): AnchorRect {
  return {
    getBoundingClientRect: () => anchor.getBoundingClientRect(),
    getClientRects: () => anchor.getClientRects(),
    contextElement: anchor,
  };
}

export const LinkToolbar: ParentComponent = (props) => {
  const editor = useEditor();
  const [visible, setVisible] = createSignal(false);
  const [editing, setEditing] = createSignal(false);
  const [url, setUrl] = createSignal('');
  const [floatEl, setFloatEl] = createSignal<HTMLDivElement>();
  const [anchor, setAnchor] = createSignal<AnchorRect | null>(null);

  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let hoveredLink: HTMLElement | null = null;
  let stopAutoUpdate: (() => void) | undefined;

  const clearHide = () => {
    if (hideTimer !== undefined) {
      clearTimeout(hideTimer);
      hideTimer = undefined;
    }
  };

  const scheduleHide = () => {
    clearHide();
    hideTimer = setTimeout(() => {
      if (editing()) return;
      setVisible(false);
      setAnchor(null);
      hoveredLink = null;
    }, 180);
  };

  const updatePosition = () => {
    const el = floatEl();
    const reference = anchor();
    if (!el || !reference) return;

    void computePosition(reference, el, {
      strategy: 'fixed',
      placement: 'top',
      middleware: [offset(8), inline(), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      // Re-check — toolbar may have closed while awaiting.
      if (!floatEl() || !anchor()) return;
      Object.assign(el.style, {
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  };

  const showAt = (nextAnchor: AnchorRect, nextUrl: string, edit: boolean) => {
    clearHide();
    setUrl(nextUrl);
    setEditing(edit);
    setAnchor(nextAnchor);
    setVisible(true);
  };

  const openEdit = (href?: string) => {
    const ed = editor();
    const current = href ?? (ed?.getAttributes('link').href as string | undefined) ?? '';
    const virtual = selectionVirtualElement(ed?.view.dom) ?? (hoveredLink ? linkVirtualElement(hoveredLink) : null);
    if (!virtual) return;
    showAt(virtual, current || 'https://', true);
  };

  const api: LinkToolbarApi = { openEdit };

  // Keep the floating UI glued to the reference across scroll / resize / layout.
  createEffect(() => {
    const el = floatEl();
    const reference = anchor();
    const isVisible = visible();
    editing();
    url();

    stopAutoUpdate?.();
    stopAutoUpdate = undefined;

    if (!isVisible || !el || !reference) return;

    stopAutoUpdate = autoUpdate(reference, el, updatePosition, {
      ancestorScroll: true,
      ancestorResize: true,
      elementResize: true,
      layoutShift: true,
      animationFrame: true,
    });

    onCleanup(() => {
      stopAutoUpdate?.();
      stopAutoUpdate = undefined;
    });
  });

  createEffect(() => {
    const ed = editor();
    if (!ed) return;

    const dom = ed.view.dom;

    const onMove = (event: MouseEvent) => {
      if (editing()) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest('a');
      if (link && dom.contains(link)) {
        hoveredLink = link as HTMLElement;
        showAt(linkVirtualElement(hoveredLink), link.getAttribute('href') ?? '', false);
        return;
      }

      if (floatEl()?.contains(target)) {
        clearHide();
        return;
      }

      scheduleHide();
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest('a');
      if (link && dom.contains(link)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      openEdit();
    };

    dom.addEventListener('mousemove', onMove);
    dom.addEventListener('click', onClick, true);
    dom.addEventListener('keydown', onKeyDown);

    onCleanup(() => {
      clearHide();
      stopAutoUpdate?.();
      stopAutoUpdate = undefined;
      dom.removeEventListener('mousemove', onMove);
      dom.removeEventListener('click', onClick, true);
      dom.removeEventListener('keydown', onKeyDown);
    });
  });

  const commitUrl = (next: string) => {
    const ed = editor();
    if (!ed) return;
    const href = normalizeUrl(next);
    ed.chain().focus().extendMarkRange('link').setLink({ href }).run();
    setUrl(href);
    setEditing(false);
    const virtual = (hoveredLink ? linkVirtualElement(hoveredLink) : null) ?? selectionVirtualElement(ed.view.dom);
    if (virtual) {
      setAnchor(virtual);
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const removeLink = () => {
    const ed = editor();
    if (!ed) return;

    const linkMark = ed.schema.marks.link;
    const linkEl = hoveredLink;

    if (linkEl && ed.view.dom.contains(linkEl) && linkMark) {
      const pos = ed.view.posAtDOM(linkEl, 0);
      const range = getMarkRange(ed.state.doc.resolve(pos), linkMark);
      if (range) {
        ed.chain().focus().setTextSelection(range).unsetLink().run();
      } else {
        ed.chain().focus().setTextSelection(pos).extendMarkRange('link').unsetLink().run();
      }
    } else if (ed.isActive('link')) {
      ed.chain().focus().extendMarkRange('link').unsetLink().run();
    }

    setVisible(false);
    setEditing(false);
    setAnchor(null);
    hoveredLink = null;
  };

  return (
    <LinkToolbarCtx.Provider value={api}>
      {props.children}
      <Show when={visible()}>
        <div
          ref={setFloatEl}
          style={{
            position: 'fixed',
            top: '0px',
            left: '0px',
            'z-index': '10000',
          }}
          onMouseEnter={clearHide}
          onMouseLeave={() => {
            if (!editing()) scheduleHide();
          }}>
          <LinkEditable
            url={url()}
            editing={editing()}
            onUrlChange={setUrl}
            onEditingChange={(edit) => {
              setEditing(edit);
              if (edit) clearHide();
            }}
            onUrlCommit={commitUrl}
            onRemove={removeLink}
          />
        </div>
      </Show>
    </LinkToolbarCtx.Provider>
  );
};
