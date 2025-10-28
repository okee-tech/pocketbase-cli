import { includeIgnoreFile } from "@eslint/compat";
import neverthrowPlugin from "@okee-tech/eslint-plugin-neverthrow";
import oclif from "eslint-config-oclif";
import prettier from "eslint-config-prettier";
import path from "node:path";
import { fileURLToPath } from "node:url";

const gitignorePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".gitignore"
);

export default [
  includeIgnoreFile(gitignorePath),
  ...oclif,
  prettier,
  neverthrowPlugin.configs.node,
];
