// RichTextEditor.jsx
import React, { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import extensions from "./extension";
import styles from "./RichTextEditor.module.css";

export default function RichTextEditor({ value, onChange }) {
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    const e = useEditor({
      extensions,
      content: value,
      onUpdate: ({ editor }) => {
        if (onChange) onChange(editor.getHTML());
      },
    });
    setEditor(e);

    return () => e?.destroy();
  }, [value, onChange]);

  if (!editor) return <div>Đang tải trình soạn thảo…</div>;

  return (
    <div className={styles.wrapper}>
      {/* Toolbar (bạn giữ nguyên) */}
      <EditorContent editor={editor} className={styles.editor} />
    </div>
  );
}
