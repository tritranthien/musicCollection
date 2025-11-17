// useTiptapEditor.js
import { useState, useEffect } from "react";
import { useEditor } from "@tiptap/react";
import extensions from "./extension";

export function useTiptapEditor({ content, onChange }) {
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    const e = useEditor({
      extensions,
      content,
      onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    });
    setEditor(e);
    return () => e?.destroy();
  }, [content, onChange]);

  return editor; // trả về instance editor, không gọi hook trực tiếp
}
