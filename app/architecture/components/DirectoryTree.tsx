/**
 * Directory Tree Viewer
 * Renders a file-system tree with syntax-highlighted node types.
 */

"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TreeNode {
  name: string;
  type: "dir" | "file" | "barrel" | "flag-file";
  children?: TreeNode[];
  annotation?: string;
  highlight?: boolean;
}

interface NodeProps {
  node: TreeNode;
  depth?: number;
  defaultOpen?: boolean;
}

function TreeNodeRow({ node, depth = 0, defaultOpen = false }: NodeProps) {
  const [open, setOpen] = useState(defaultOpen || depth < 2);
  const hasChildren = node.type === "dir" && node.children && node.children.length > 0;

  const icon = () => {
    if (node.type === "dir") {
      return open
        ? <FolderOpen className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
        : <Folder     className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />;
    }
    if (node.type === "flag-file") {
      return <FileCode className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />;
    }
    if (node.type === "barrel") {
      return <FileText className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />;
    }
    return <FileCode className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />;
  };

  return (
    <li>
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 w-full text-left py-0.5 rounded transition-colors group",
          hasChildren ? "cursor-pointer hover:bg-slate-800/60" : "cursor-default",
          node.highlight && "bg-violet-900/30"
        )}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
      >
        {hasChildren ? (
          open
            ? <ChevronDown  className="h-3 w-3 text-slate-500 flex-shrink-0" />
            : <ChevronRight className="h-3 w-3 text-slate-500 flex-shrink-0" />
        ) : (
          <span className="w-3 flex-shrink-0" />
        )}
        {icon()}
        <span className={cn(
          "font-mono text-xs",
          node.type === "dir"       && "text-slate-200 font-semibold",
          node.type === "flag-file" && "text-violet-300",
          node.type === "barrel"    && "text-sky-300",
          node.type === "file"      && "text-slate-400",
        )}>
          {node.name}
        </span>
        {node.annotation && (
          <span className="ml-2 text-[10px] font-mono text-slate-600 group-hover:text-slate-500 transition-colors">
            {node.annotation}
          </span>
        )}
      </button>

      {hasChildren && open && node.children && (
        <ul>
          {node.children.map((child, i) => (
            <TreeNodeRow key={`${child.name}-${i}`} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

interface DirectoryTreeProps {
  tree: TreeNode[];
  className?: string;
}

export function DirectoryTree({ tree, className }: DirectoryTreeProps) {
  return (
    <ul className={cn("select-none", className)}>
      {tree.map((node, i) => (
        <TreeNodeRow key={`${node.name}-${i}`} node={node} depth={0} defaultOpen />
      ))}
    </ul>
  );
}
