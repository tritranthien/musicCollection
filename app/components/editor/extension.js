import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import FontSize from "tiptap-extension-font-size";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import Youtube from "@tiptap/extension-youtube";
import CodeBlock from '@tiptap/extension-code-block';

export const extensions = [
  StarterKit.configure({
    codeBlock: false,
  }),

  Underline,
  Highlight,

  TextStyle,
  Color,
  FontFamily,
  FontSize,

  Link.configure({
    openOnClick: false,
  }),

  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),

  Placeholder.configure({
    placeholder: "Nhập nội dung…",
  }),

  CharacterCount,

  CodeBlock, // code block bình thường

  Image.configure({
    inline: false,
    allowBase64: true,
  }),

  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,

  Youtube.configure({
    width: 640,
    height: 360,
  }),
];
