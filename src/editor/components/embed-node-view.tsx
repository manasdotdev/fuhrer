import type { NodeViewProps } from '@tiptap/core';
import { Show, createEffect, createMemo, createSignal, type Component } from 'solid-js';

import { resolveEmbed } from '../utils/resolve-embed';

import styles from '../styles/embed-node.module.css';

export const EmbedNodeView: Component<NodeViewProps> = (props) => {
  const [draft, setDraft] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);
  let inputRef: HTMLInputElement | undefined;

  const embedUrl = createMemo(() => (props.node.attrs.embedUrl as string | null) ?? null);
  const caption = createMemo(() => (props.node.attrs.caption as string | null) ?? '');
  const aspectRatio = createMemo(() => (props.node.attrs.aspectRatio as string | null) || '16 / 9');
  const height = createMemo(() => props.node.attrs.height as number | null);
  const hasEmbed = createMemo(() => !!embedUrl());
  const selected = createMemo(() => props.selected);

  createEffect(() => {
    if (hasEmbed() || !props.selected) return;
    queueMicrotask(() => inputRef?.focus());
  });

  const selectCard = () => {
    const pos = props.getPos();
    if (typeof pos !== 'number') return;
    props.editor.chain().focus().setNodeSelection(pos).run();
  };

  const commitUrl = (raw: string) => {
    const resolved = resolveEmbed(raw);
    if (!resolved) {
      setError("Sorry, that link isn't supported.");
      return;
    }
    setError(null);
    setDraft('');
    props.updateAttributes({
      url: resolved.url,
      embedUrl: resolved.embedUrl,
      provider: resolved.provider,
      aspectRatio: resolved.aspectRatio,
      height: resolved.height ?? null,
    });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      commitUrl(draft());
    }
  };

  const onPaste = (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData('text')?.trim();
    if (!text) return;
    // Prefer resolving on paste so iframe HTML works in one step.
    const resolved = resolveEmbed(text);
    if (!resolved) return;
    e.preventDefault();
    setDraft(text);
    commitUrl(text);
  };

  return (
    <div class={styles.card} data-drag-handle draggable='true' onMouseDown={selectCard}>
      <figure class={styles.figure}>
        <Show
          when={hasEmbed()}
          fallback={
            <div class={styles.empty} contentEditable={false}>
              <input
                ref={inputRef}
                type='url'
                class={styles.urlInput}
                value={draft()}
                placeholder='Paste URL to add embedded content...'
                aria-label='Embed URL'
                onMouseDown={(e) => e.stopPropagation()}
                onInput={(e) => {
                  setDraft(e.currentTarget.value);
                  if (error()) setError(null);
                }}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
              />
              <Show when={error()}>{(msg) => <p class={styles.error}>{msg()}</p>}</Show>
            </div>
          }>
          <div class={styles.filled} classList={{ [styles.filledSelected]: selected() }}>
            <div
              class={styles.frameWrap}
              style={
                height()
                  ? { height: `${height()}px` }
                  : { 'aspect-ratio': aspectRatio() }
              }>
              <iframe
                class={styles.frame}
                src={embedUrl()!}
                title='Embedded content'
                loading='lazy'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                allowfullscreen
                referrerpolicy='strict-origin-when-cross-origin'
              />
            </div>
            <Show when={selected()}>
              <div class={styles.meta} contentEditable={false}>
                <input
                  type='text'
                  class={styles.metaInput}
                  value={caption()}
                  placeholder='Type caption for embed (optional)'
                  onMouseDown={(e) => e.stopPropagation()}
                  onInput={(e) => props.updateAttributes({ caption: e.currentTarget.value || null })}
                />
              </div>
            </Show>
          </div>
          <Show when={!selected() && caption()}>
            <figcaption class={styles.caption}>{caption()}</figcaption>
          </Show>
        </Show>
      </figure>
    </div>
  );
};
