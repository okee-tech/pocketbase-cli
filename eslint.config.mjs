import pluginJs from "@eslint/js";
import neverthrowPlugin from "@okee-tech/eslint-plugin-neverthrow";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  neverthrowPlugin.configs.node,
];
