import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';

export const getExtensions = (placeholder: string) => [
  StarterKit.configure({
    codeBlock: false,
  }),
  CodeBlockLowlight.configure({
    lowlight: createLowlight(),
    defaultLanguage: 'plaintext',
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return `Título ${node.attrs.level}`;
      }
      return placeholder;
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph', 'image'],
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'left',
  }),
  Underline,
  Typography,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-primary underline',
    },
  }),
  Image.configure({
    inline: true,
    allowBase64: true,
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Color,
  Highlight,
  TextStyle,
  Superscript,
  Subscript,
  TextStyle.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        style: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('style'),
          renderHTML: (attributes: { style?: string }) => {
            if (!attributes.style) {
              return {};
            }
            return { style: attributes.style };
          },
        },
        fontSize: {
          default: null,
          parseHTML: (element: HTMLElement) => {
            const size = element.style.fontSize;
            return size || null;
          },
          renderHTML: (attributes: { fontSize?: string }) => {
            if (!attributes.fontSize) {
              return {};
            }
            return { style: `font-size: ${attributes.fontSize}` };
          },
        },
      };
    },
  }),
];
