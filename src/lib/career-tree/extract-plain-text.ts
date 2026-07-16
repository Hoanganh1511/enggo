export function extractPlainText(content: Record<string, unknown>): string {
  const texts: string[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const obj = node as { text?: string; content?: unknown[] };
    if (typeof obj.text === "string") texts.push(obj.text);
    if (Array.isArray(obj.content)) obj.content.forEach(walk);
  }
  walk(content);
  return texts.join(" ").trim();
}
