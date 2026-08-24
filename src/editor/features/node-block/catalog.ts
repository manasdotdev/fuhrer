/**
 * Every listed block is draggable;
 */
export type BlockKind = 'atom' | 'container';

export type BlockDefinition = {
  /** TipTap node name when known; catalog key otherwise */
  name: string;
  kind: BlockKind;
  /** Empty placeholders (e.g. imageUpload) stay non-draggable until they become content. */
  draggable: boolean;
};

export const BLOCK_CATALOG = {
  image: { name: 'image', kind: 'atom', draggable: true },
  imageUpload: { name: 'imageUpload', kind: 'atom', draggable: false },
  divider: { name: 'horizontalRule', kind: 'atom', draggable: true },
  button: { name: 'button', kind: 'atom', draggable: true },
  bookmark: { name: 'bookmark', kind: 'atom', draggable: true },
  gallery: { name: 'gallery', kind: 'atom', draggable: true },
  publicPreview: { name: 'publicPreview', kind: 'atom', draggable: true },
  callToAction: { name: 'callToAction', kind: 'atom', draggable: true },
  emailContent: { name: 'emailContent', kind: 'container', draggable: true },
  callout: { name: 'callout', kind: 'container', draggable: true },
  signup: { name: 'signup', kind: 'atom', draggable: true },
  header: { name: 'header', kind: 'container', draggable: true },
  toggle: { name: 'toggle', kind: 'container', draggable: true },
  video: { name: 'video', kind: 'atom', draggable: true },
  audio: { name: 'audio', kind: 'atom', draggable: true },
  file: { name: 'file', kind: 'atom', draggable: true },
  product: { name: 'product', kind: 'atom', draggable: true },
  html: { name: 'html', kind: 'atom', draggable: true },
  markdown: { name: 'markdown', kind: 'atom', draggable: true },
  youtube: { name: 'youtube', kind: 'atom', draggable: true },
  unsplash: { name: 'unsplash', kind: 'atom', draggable: true },
  x: { name: 'x', kind: 'atom', draggable: true },
  vimeo: { name: 'vimeo', kind: 'atom', draggable: true },
  codepen: { name: 'codepen', kind: 'atom', draggable: true },
  spotify: { name: 'spotify', kind: 'atom', draggable: true },
  soundcloud: { name: 'soundcloud', kind: 'atom', draggable: true },
} as const satisfies Record<string, BlockDefinition>;

export type BlockCatalogKey = keyof typeof BLOCK_CATALOG;
