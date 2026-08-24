import { Extension, type Extensions } from '@tiptap/core';
import { Placeholder, type PlaceholderOptions } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import type { StarterKitOptions } from '@tiptap/starter-kit';

import { CustomHorizontalRule } from '../extensions/divider';
import { ImageFileHandler } from '../extensions/file-handler';
import { CustomImage } from '../extensions/image';
import { ImageUpload, type ImageUploadOptions } from '../extensions/image-upload';
import { BlockDragPreview, type BlockDragPreviewOptions } from '../features/node-block';
import { SlashCommands } from '../features/slash-menu';

export type FuhrerKitOptions = {
  starterKit: Partial<StarterKitOptions> | false;
  placeholder: Partial<PlaceholderOptions> | false;
  blockDrag: Partial<BlockDragPreviewOptions> | false;
  divider: false | Record<string, never>;
  image: false | Record<string, never>;
  imageUpload: Partial<ImageUploadOptions> | false;
  fileHandler: false | Record<string, never>;
  slash: false | Record<string, never>;
};

/**
 * Opinionated extension bundle — TipTap StarterKit pattern for fuhrer.
 * Disable pieces with `false`, or pass partial options to configure.
 *
 * @see https://tiptap.dev/docs/editor/extensions/functionality/starterkit
 */
export const FuhrerKit = Extension.create<FuhrerKitOptions>({
  name: 'fuhrerKit',

  addExtensions() {
    const extensions: Extensions = [];
    const { starterKit, placeholder, blockDrag, divider, image, imageUpload, fileHandler, slash } = this.options;

    if (starterKit !== false) {
      extensions.push(
        StarterKit.configure({
          horizontalRule: false,
          gapcursor: false,
          dropcursor: {
            color: '#22c55e',
            width: 3,
          },
          ...starterKit,
        }),
      );
    }

    if (placeholder !== false) {
      extensions.push(
        Placeholder.configure({
          placeholder: 'Write something …',
          ...placeholder,
        }),
      );
    }

    if (blockDrag !== false) {
      extensions.push(BlockDragPreview.configure(blockDrag ?? {}));
    }

    if (divider !== false) {
      extensions.push(CustomHorizontalRule);
    }

    if (image !== false) {
      extensions.push(CustomImage);
    }

    if (imageUpload !== false) {
      extensions.push(ImageUpload.configure(imageUpload ?? {}));
    }

    if (fileHandler !== false) {
      extensions.push(ImageFileHandler);
    }

    if (slash !== false) {
      extensions.push(SlashCommands);
    }

    return extensions;
  },

  addOptions() {
    return {
      starterKit: {},
      placeholder: {},
      blockDrag: {},
      divider: {},
      image: {},
      imageUpload: {},
      fileHandler: {},
      slash: {},
    };
  },
});
