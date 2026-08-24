// barrel index file

// Layer 0 — Solid binding
export {
  createEditor,
  createEditorState,
  createEditorTransaction,
  EditorContent,
  EditorProvider,
  NodeViewContent,
  NodeViewWrapper,
  SolidNodeView,
  SolidNodeViewRenderer,
  SolidRenderer,
  useCurrentEditor,
  useEditorContext,
  useOptionalEditorContext,
  useSolidNodeView,
  type CreateEditorConfig,
  type CreateEditorOptions,
  type CreateEditorStateOptions,
  type EditorContentProps,
  type EditorContextValue,
  type EditorProviderProps,
  type EditorStateEvent,
  type EditorStateSnapshot,
  type NodeViewContentProps,
  type NodeViewWrapperProps,
  type SolidNodeViewProps,
  type SolidNodeViewRendererOptions,
  type SolidRendererOptions,
} from './solid';

// Layer 1 — Extensions
export { CustomHorizontalRule, CustomImage, ImageFileHandler, ImageUpload, type ImageUploadFn, type ImageUploadOptions } from './extensions';

// Layer 2 — Features
export {
  asDraggableBlock,
  BLOCK_CATALOG,
  BLOCK_CHROME_CLASS,
  BlockDragPreview,
  BlockShell,
  mergeBlockChromeClass,
  withBlockHTMLAttributes,
  type BlockCatalogKey,
  type BlockDefinition,
  type BlockDragPreviewOptions,
  type BlockKind,
  type BlockShellProps,
} from './features/node-block';

export { getSlashItems, SlashCommands, SlashCommandsPluginKey, SlashMenuList, type SlashItem, type SlashMenuListProps } from './features/slash-menu';

// Layer 4 — Lib
export { imageAltFromFileName, uploadImageAsDataUrl } from './utils/upload-image';

// Layer 5 — Kits
export { FuhrerKit, type FuhrerKitOptions } from './kits/fuhrer-kit';

// Layer 6 — Templates
export { DefaultEditor, type DefaultEditorProps } from './components/default-editor';
