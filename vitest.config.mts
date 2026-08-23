import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Config test toi thieu - CHI dung cho unit test logic thuan (vd pushBlocks,
// khong dung DOM/React) nen KHONG can jsdom/@testing-library. Alias "@/"
// khop tsconfig.json de test co the import cung duong dan voi code that.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
});
