import { Editable } from '@ark-ui/solid/editable';
import { Show, createMemo, type Component } from 'solid-js';

import { GlobeIcon, PencilIcon, TrashIcon } from '../styles/icons';
import { isValidUrl, normalizeUrl } from '../utils/is-valid-url';

import styles from '../styles/link-editable.module.css';

export type LinkEditableProps = {
  url: string;
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  onUrlChange?: (url: string) => void;
  onUrlCommit?: (url: string) => void;
  onRemove?: () => void;
  class?: string;
};

export const LinkEditable: Component<LinkEditableProps> = (props) => {
  const valid = createMemo(() => isValidUrl(props.url));
  const normalized = createMemo(() => (valid() ? normalizeUrl(props.url) : ''));

  return (
    <Editable.Root
      class={`${styles.root}${props.class ? ` ${props.class}` : ''}`}
      value={props.url}
      edit={props.editing}
      activationMode='none'
      selectOnFocus
      invalid={!valid()}
      placeholder='https://'
      submitMode='both'
      onValueChange={(details) => props.onUrlChange?.(details.value)}
      onEditChange={(details) => props.onEditingChange?.(details.edit)}
      onValueCommit={(details) => {
        if (!isValidUrl(details.value)) {
          props.onEditingChange?.(true);
          return;
        }
        props.onUrlCommit?.(normalizeUrl(details.value));
      }}
      onValueRevert={() => props.onEditingChange?.(false)}>
      <Editable.Context>
        {(api) => (
          <Show
            when={api().editing}
            fallback={
              <div class={styles.pill}>
                <a
                  class={`${styles.preview}${valid() ? '' : ` ${styles.previewDisabled}`}`}
                  href={normalized() || undefined}
                  target='_blank'
                  rel='noopener noreferrer'
                  title={props.url}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    if (!valid()) e.preventDefault();
                  }}>
                  {props.url || 'https://'}
                </a>
                {/* Keep Preview mounted for Ark state; visually unused */}
                <Editable.Area style={{ display: 'none' }}>
                  <Editable.Preview />
                </Editable.Area>
                <div class={styles.actions}>
                  <Editable.Control class={styles.control}>
                    <Editable.EditTrigger class={styles.iconButton} aria-label='Edit link'>
                      <PencilIcon />
                    </Editable.EditTrigger>
                  </Editable.Control>
                  <button
                    type='button'
                    class={styles.iconButton}
                    aria-label='Remove link'
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      props.onRemove?.();
                    }}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
            }>
            <div class={styles.card}>
              <Editable.Area>
                <Editable.Input
                  class={styles.input}
                  classList={{
                    [styles.inputValid]: valid(),
                    [styles.inputInvalid]: !!props.url.trim() && !valid(),
                  }}
                />
              </Editable.Area>
              <Editable.Label class={styles.label}>Link to web page</Editable.Label>
              <a
                class={styles.openRow}
                href={normalized() || undefined}
                target='_blank'
                rel='noopener noreferrer'
                aria-disabled={!valid() ? 'true' : undefined}
                onMouseDown={(e) => {
                  if (!valid()) e.preventDefault();
                }}>
                <GlobeIcon />
                <span class={styles.openUrl}>{normalized() || props.url || 'https://'}</span>
              </a>
            </div>
          </Show>
        )}
      </Editable.Context>
    </Editable.Root>
  );
};
