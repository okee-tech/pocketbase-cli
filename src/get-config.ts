import "dotenv/config";

import { Result, err, ok } from "neverthrow";
import fs from "node:fs";
import path from "node:path";
import { SettingsSchemaConfig, parseConfig } from "./config.js";

type Project = {
  configPath: string;
  projectRoot: string;
  config: SettingsSchemaConfig;
};

function getProject(): Result<Project, Error> {
  const basePath = process.cwd();

  const configPathResult = findPocketBaseProject(basePath, 2);

  if (configPathResult.isErr())
    return err(new Error("No PocketBase project found"));

  const configResult = parseConfig(configPathResult.value);
  if (configResult.isErr()) return err(configResult.error);

  return ok({
    configPath: configPathResult.value,
    projectRoot: path.join(configPathResult.value, "..", ".."),
    config: configResult.value,
  });
}

function isPathPocketBaseProject(basePath: string): Result<string, Error> {
  const hasFolderResult = Result.fromThrowable(() =>
    fs.statSync(path.join(basePath, "pocketbase"))
  )();

  const configPath = path.join(basePath, "pocketbase", "config.toml");
  const hasConfigResult = Result.fromThrowable(() => fs.statSync(configPath))();
  if (hasFolderResult.isErr() || hasConfigResult.isErr())
    return err(new Error("No PocketBase folder"));
  if (!hasFolderResult.value.isDirectory())
    return err(new Error("No PocketBase config"));
  if (!hasConfigResult.value.isFile())
    return err(new Error("PocketBase config is not a file"));

  return ok(configPath);
}

function findPocketBaseProject(
  startPath: string,
  maxDepth: number
): Result<string, Error> {
  const visited = new Set<string>();

  function search(currentPath: string, depth: number): Result<string, Error> {
    if (visited.has(currentPath) || depth > maxDepth)
      return err(new Error("Not found"));
    visited.add(currentPath);

    const possibleConfig = isPathPocketBaseProject(currentPath);
    if (possibleConfig.isOk()) return ok(possibleConfig.value);

    // 🔼 parent search
    const parent = path.dirname(currentPath);
    if (parent !== currentPath) {
      const parentResult = search(parent, depth + 1);
      if (parentResult.isOk()) return parentResult;
      // don’t return if it’s an error → continue to children
    }

    // 🔽 child search
    const entriesResult = Result.fromThrowable(() =>
      fs.readdirSync(currentPath, { withFileTypes: true })
    )();
    if (entriesResult.isErr()) return err(entriesResult.error as Error);

    for (const entry of entriesResult.value) {
      if (!entry.isDirectory()) continue;
      const childPath = path.join(currentPath, entry.name);
      const childResult = search(childPath, depth + 1);
      if (childResult.isOk()) return childResult;
    }

    return err(new Error("Not found"));
  }

  return search(startPath, 0);
}

export { getProject as getConfig };
