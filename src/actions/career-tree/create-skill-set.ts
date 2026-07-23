"use server";

import { revalidatePath } from "next/cache";
import { createWorkspace } from "@/lib/api/workspaces";
import { createNode, updateNode } from "@/lib/api/nodes";
import { createTier } from "@/lib/api/tiers";
import { createCategory } from "@/lib/api/categories";
import type { SkillSetPreset } from "@/content/skill-set-presets";

// Workspace moi PHAI co dung 1 node parentId=null ngay khi tao - Career Tree
// canvas (buildHierarchy trong transform.ts) throw loi neu workspace co 0
// hoac >1 root node. Node nay chi la "khung" (kind BRANCH), khong gan tier.
export async function createBlankSkillSetAction(name: string) {
  const workspace = await createWorkspace(name);
  await createNode(workspace.id, {
    parentId: null,
    title: name,
    kind: "BRANCH",
  });
  revalidatePath("/skill-tree");
  return workspace;
}

export async function createSkillSetFromPresetAction(preset: SkillSetPreset) {
  const workspace = await createWorkspace(preset.name);
  const root = await createNode(workspace.id, {
    parentId: null,
    title: preset.name,
    kind: "BRANCH",
  });

  for (const categoryDef of preset.categories) {
    const category = await createCategory(workspace.id, {
      name: categoryDef.name,
    });

    for (const tierDef of categoryDef.tiers) {
      const tier = await createTier(category.id, {
        label: tierDef.label,
        sublabel: tierDef.sublabel,
      });
      await Promise.all(
        tierDef.skills.map(async (skill) => {
          const node = await createNode(workspace.id, {
            parentId: root.id,
            title: skill.title,
            kind: "TOPIC",
            tierId: tier.id,
          });
          if (skill.difficulty) {
            await updateNode(workspace.id, node.id, {
              difficulty: skill.difficulty,
            });
          }
        }),
      );
    }
  }

  revalidatePath("/skill-tree");
  return workspace;
}
