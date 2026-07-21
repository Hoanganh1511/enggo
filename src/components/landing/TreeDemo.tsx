"use client";

import { useState } from "react";
import { FileText, Folder, Target } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import GrowthCard from "@/components/ui/growth-card";
import type { LearningStreakData } from "@/components/ui/learning-streak";

type DemoNode = {
  id: string;
  parentId: string | null;
  title: string;
  subtitle: string;
  streak: LearningStreakData;
  lastActivity: string | null;
  done: number;
  total: number;
};

const NODES: DemoNode[] = [
  {
    id: "career",
    parentId: null,
    title: "Sự nghiệp của tôi",
    subtitle: "12 ghi chú",
    streak: {
      current: 8,
      longest: 20,
      last7: [true, true, false, true, true, true, true],
    },
    lastActivity: new Date().toISOString(),
    done: 8,
    total: 12,
  },
  {
    id: "backend",
    parentId: "career",
    title: "Backend",
    subtitle: "9 ghi chú",
    streak: {
      current: 12,
      longest: 12,
      last7: [true, true, true, true, true, true, true],
    },
    lastActivity: new Date().toISOString(),
    done: 9,
    total: 10,
  },
  {
    id: "api-design",
    parentId: "backend",
    title: "API Design",
    subtitle: "4 ghi chú",
    streak: {
      current: 4,
      longest: 6,
      last7: [false, true, true, true, false, true, true],
    },
    lastActivity: new Date().toISOString(),
    done: 4,
    total: 6,
  },
  {
    id: "database",
    parentId: "backend",
    title: "Database",
    subtitle: "3 ghi chú",
    streak: {
      current: 2,
      longest: 5,
      last7: [false, false, false, true, false, true, true],
    },
    lastActivity: new Date().toISOString(),
    done: 3,
    total: 8,
  },
  {
    id: "authentication",
    parentId: "backend",
    title: "Authentication",
    subtitle: "2 ghi chú",
    streak: {
      current: 6,
      longest: 6,
      last7: [true, true, true, true, true, true, true],
    },
    lastActivity: new Date().toISOString(),
    done: 2,
    total: 4,
  },
  {
    id: "english",
    parentId: "career",
    title: "English",
    subtitle: "1 ghi chú",
    streak: {
      current: 0,
      longest: 5,
      last7: [false, false, false, false, false, false, false],
    },
    lastActivity: "2026-05-01T00:00:00.000Z",
    done: 1,
    total: 10,
  },
  {
    id: "new-node",
    parentId: "career",
    title: "Node mới",
    subtitle: "0 ghi chú",
    streak: {
      current: 0,
      longest: 0,
      last7: [false, false, false, false, false, false, false],
    },
    lastActivity: null,
    done: 0,
    total: 0,
  },
];

function getChildren(id: string | null): DemoNode[] {
  return NODES.filter((n) => n.parentId === id);
}

function iconFor(node: DemoNode) {
  if (node.parentId === null) return Target;
  return getChildren(node.id).length > 0 ? Folder : FileText;
}

type TreeDemoProps = {
  highlight?: string[];
  className?: string;
};

const TreeDemo = ({ highlight = [], className = "" }: TreeDemoProps) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  function renderNode(node: DemoNode) {
    const children = getChildren(node.id);
    const isCollapsed = collapsed.has(node.id);
    const isHighlighted = highlight.includes(node.id);

    return (
      <li key={node.id} className="flex flex-col">
        <div
          className={`rounded-2xl transition-shadow duration-200 ${
            isHighlighted
              ? "shadow-[0_0_0_2px_var(--color-primary)] ring-offset-2"
              : ""
          }`}
        >
          <GrowthCard
            icon={iconFor(node)}
            title={node.title}
            subtitle={node.subtitle}
            branches={children.length}
            streak={node.streak}
            lastActivity={node.lastActivity}
            done={node.done}
            total={node.total}
            isCollapsed={isCollapsed}
            onToggleCollapse={
              children.length > 0 ? () => toggle(node.id) : undefined
            }
          />
        </div>
        {children.length > 0 && !isCollapsed && (
          <ul className="mt-3 ml-6 flex flex-col gap-3 border-l border-tree-line pl-6">
            {children.map((child) => renderNode(child))}
          </ul>
        )}
      </li>
    );
  }

  const roots = getChildren(null);

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className={`overflow-x-auto ${className}`}>
        <ul className="flex min-w-max flex-col gap-3">
          {roots.map((root) => renderNode(root))}
        </ul>
      </div>
    </Tooltip.Provider>
  );
};

export default TreeDemo;
