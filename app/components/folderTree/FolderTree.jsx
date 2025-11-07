import React, { useState, useEffect } from "react";
import styles from "./FolderTree.module.css";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  BookOpen,
  Minus,
  Plus,
} from "lucide-react";
import { Link } from "react-router";

/**
 * data: array of nodes
 * node: { id, name, files?: [], children?: [] }
 *
 * Behavior:
 * - Root items (depth 0) are closed by default.
 * - Click root label toggles showing its children (Lớp 1..12).
 * - Only one child (class) in a root can be open at once (accordion).
 * - Clicking a class will open it and close other classes (within same root).
 * - Selected node is highlighted.
 * - Collapse All button next to root will close all children of that root.
 * - Smooth expand/collapse animation (CSS-only).
 */

export default function FolderTree({ data }) {
  // signal per root to tell child nodes to collapse
  const [collapseSignals, setCollapseSignals] = useState({});
  // selected node id for highlight
  const [selectedId, setSelectedId] = useState(null);

  const toggleCollapseForRoot = (rootId) => {
    setCollapseSignals((prev) => ({
      ...prev,
      [rootId]: (prev[rootId] || 0) + 1,
    }));
  };

  return (
    <div className={styles.tree}>
      {data.map((root) => (
        <RootNode
          key={root.id}
          node={root}
          collapseSignal={collapseSignals[root.id] || 0}
          onCollapseAll={() => toggleCollapseForRoot(root.id)}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
      ))}
    </div>
  );
}

/* Root node (depth 0) */
function RootNode({
  node,
  collapseSignal,
  onCollapseAll,
  selectedId,
  setSelectedId,
}) {
  const [open, setOpen] = useState(false);
  // track which immediate child (class) is open (only one)
  const [openChildId, setOpenChildId] = useState(null);

  useEffect(() => {
    // when collapseSignal increments => close everything under this root
    if (collapseSignal && collapseSignal > 0) {
      setOpen(false);
      setOpenChildId(null);
    }
  }, [collapseSignal]);

  const toggleRoot = () => {
    setOpen((o) => !o);
  };

  return (
    <div className={styles.rootBlock}>
      <div className={styles.rootLine}>
        <div
          className={styles.rootLabel}
          onClick={() => {
            setSelectedId(node.id);
            toggleRoot();
          }}
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className={styles.rootText}>{node.name}</span>
        </div>

        <div className={styles.rootControls}>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={onCollapseAll}
            title="Đóng tất cả mục con"
          >
            <Minus size={14} />
          </button>
        </div>
      </div>

      {/* children of root (Lớp 1..12) */}
      <div
        className={`${styles.rootChildren} ${open ? styles.expand : styles.collapse}`}
      >
        {open &&
          node.children?.map((child) => (
            <TreeNodeLevel1
              key={child.id}
              node={child}
              collapseSignal={collapseSignal}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              openChildId={openChildId}
              setOpenChildId={setOpenChildId}
            />
          ))}
      </div>
    </div>
  );
}

/* Level-1 TreeNode (e.g., Lớp 1..12) */
function TreeNodeLevel1({
  node,
  collapseSignal,
  selectedId,
  setSelectedId,
  openChildId,
  setOpenChildId,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (collapseSignal && collapseSignal > 0) {
      setOpen(false);
    }
  }, [collapseSignal]);

  const hasChildren = node.children && node.children.length > 0;
  const hideFolderIcon = false; // for classes we keep simple icon behavior (folder shown)

  const handleClick = () => {
    setSelectedId(node.id);
    if (hasChildren) {
      if (openChildId !== node.id) {
        setOpenChildId(node.id);
        setOpen(true);
      } else {
        // toggle same node
        setOpen((o) => !o);
        if (open) setOpenChildId(null);
      }
    }
  };

  // if another class opens, close this one
  useEffect(() => {
    if (openChildId !== node.id) setOpen(false);
  }, [openChildId, node.id]);

  return (
    <div className={styles.node}>
      <div
        className={`${styles.label} ${selectedId === node.id ? styles.selected : ""}`}
        onClick={handleClick}
      >
        {hasChildren ? (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span style={{ width: 14 }} />}
        {!hideFolderIcon && <Folder size={14} color="#f59e0b" />}
        <span>{node.name}</span>
      </div>

      {/* show children (lectures/videos/images/documents) with animation container */}
      <div className={`${styles.children} ${open ? styles.expand : styles.collapse}`}>
        {open &&
          hasChildren &&
          node.children.map((child) => (
            <TreeNodeLower
              key={child.id}
              node={child}
              collapseSignal={collapseSignal}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
            />
          ))}
      </div>
    </div>
  );
}

/* Lower levels (e.g., "Bài giảng", "Video", "Hình ảnh", "Tài liệu") */
function TreeNodeLower({ node, collapseSignal, selectedId, setSelectedId }) {
  // these are leaf categories; they might have files but we don't expand by default here
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (collapseSignal && collapseSignal > 0) setOpen(false);
  }, [collapseSignal]);

  const hasChildren = node.children && node.children.length > 0;
  // hide folder icon for these categories per your request
  const hideFolderIcon = ["bài giảng", "video", "hình ảnh", "tài liệu"].some((k) =>
    node.name.toLowerCase().includes(k)
  );

  const handleClick = () => {
    setSelectedId(node.id);
    
    if (hasChildren) setOpen((s) => !s);
  };

  return (
    <div className={styles.node}>
      <div
        className={`${styles.label} ${selectedId === node.id ? styles.selected : ""}`}
        onClick={handleClick}
      >
        {/* leaf may not have chevron */}
        {hasChildren ? (open ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : <span style={{ width: 12 }} />}
        {!hideFolderIcon && <Folder size={12} color="#f59e0b" />}
        <Link to={`/dashboard/class/${node.id}`}>{node.name}</Link>
      </div>

      {/* if this lower node has children, render them (rare in our structure) */}
      <div className={`${styles.children} ${open ? styles.expand : styles.collapse}`}>
        {open &&
          hasChildren &&
          node.children.map((c) => (
            <TreeNodeLower
              key={c.id}
              node={c}
              collapseSignal={collapseSignal}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
            />
          ))}
      </div>
    </div>
  );
}
