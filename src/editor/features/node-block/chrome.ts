/**
 * Shared class for block hover / selection chrome.
 * @see src/editor/styles/editor.css
 */
export const BLOCK_CHROME_CLASS = 'block-chrome';

export function mergeBlockChromeClass(...classNames: Array<string | undefined | null | false>): string {
  return [BLOCK_CHROME_CLASS, ...classNames].filter(Boolean).join(' ');
}

/**
 * Merge TipTap `HTMLAttributes` with the shared block chrome class.
 * @see https://tiptap.dev/docs/editor/getting-started/style-editor
 */
export function withBlockHTMLAttributes(HTMLAttributes: Record<string, unknown> = {}): Record<string, unknown> {
  const existing = HTMLAttributes.class;
  return {
    ...HTMLAttributes,
    class: mergeBlockChromeClass(typeof existing === 'string' ? existing : undefined),
  };
}
