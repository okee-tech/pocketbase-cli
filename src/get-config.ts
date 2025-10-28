import { Result, ok } from "neverthrow";
import fs from "node:fs";
import path from "node:path";
import { parseConfig } from "./config.js";

function getConfig(): Result<unknown, Error> {
  const basePath = process.cwd();
  const foundPath = findPocketBaseProject(basePath, 2);

  if (!foundPath) throw new Error("No PocketBase project found");

  const configPath = path.join(foundPath, "pocketbase", "pb_config.toml");
  const configResult = parseConfig(configPath);
  if (configResult.isErr()) return configResult;

  return ok({
    configPath: configPath,
    projectRoot: foundPath,
    config: configResult.value,
  });
}

function isPathPocketBaseProject(basePath: string): boolean {
  const hasFolderResult = Result.fromThrowable(() =>
    fs.statSync(path.join(basePath, "pocketbase"))
  )();
  const hasConfigResult = Result.fromThrowable(() =>
    fs.statSync(path.join(basePath, "pocketbase", "pb_config.toml"))
  )();
  if (hasFolderResult.isErr() || hasConfigResult.isErr()) return false;
  if (!hasFolderResult.value.isDirectory()) return false;
  if (!hasConfigResult.value.isFile()) return false;

  return true;
}

function findPocketBaseProject(
  startPath: string,
  maxDepth: number
): null | string {
  const visited = new Set<string>();

  function search(currentPath: string, depth: number): null | string {
    if (visited.has(currentPath) || depth > maxDepth) return null;
    visited.add(currentPath);

    if (isPathPocketBaseProject(currentPath)) return currentPath;

    const parent = path.dirname(currentPath);
    if (parent !== currentPath) {
      const parentResult = search(parent, depth + 1);
      if (parentResult) return parentResult;
    }

    const entriesResult = Result.fromThrowable(() =>
      fs.readdirSync(currentPath, {
        withFileTypes: true,
      })
    )();
    if (entriesResult.isErr()) return null;

    for (const entry of entriesResult.value) {
      if (!entry.isDirectory()) continue;
      const childPath = path.join(currentPath, entry.name);
      const result = search(childPath, depth + 1);
      if (result) return result;
    }

    return null;
  }

  return search(startPath, 0);
}

export { getConfig };
