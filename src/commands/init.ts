import { Command } from "@oclif/core";

import { Result } from "neverthrow";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getConfig } from "../get-config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLES_DIR = path.join(__dirname, "..", "samples");

export default class Init extends Command {
  static override args = {};
  static override description =
    "Initialized PocketBase project in current directory";
  static override examples = ["<%= config.bin %> <%= command.id %>"];
  static override flags = {};

  public async run(): Promise<void> {
    await this.parse(Init);

    const currentPath = process.cwd();
    const pocketbasePath = path.join(currentPath, "pocketbase");
    const configPath = path.join(pocketbasePath, "config.toml");

    const pocketbaseExists = Result.fromThrowable(() =>
      fs.statSync(pocketbasePath)
    )();
    if (pocketbaseExists.isOk())
      this.error("PocketBase project already initialized in this directory.");

    const currentProjectName = path.basename(currentPath);

    const initResult = Result.fromThrowable(() => {
      fs.mkdirSync(pocketbasePath, { recursive: true });
      fs.cpSync(SAMPLES_DIR, pocketbasePath, { recursive: true });

      const config = fs.readFileSync(configPath, "utf-8");
      const updatedConfig = config.replaceAll("#APP_NAME#", currentProjectName);

      fs.writeFileSync(configPath, updatedConfig, "utf-8");
      fs.writeFileSync(
        path.join(pocketbasePath, ".gitignore"),
        ".pb\n",
        "utf-8"
      );
    })();

    if (initResult.isErr())
      this.error(
        `Failed to initialize PocketBase project: ${initResult.error}`
      );

    const newConfig = getConfig();
    if (newConfig.isErr())
      this.error(`Failed to parse new config: ${newConfig.error}`);

    this.log(
      `Initialized PocketBase project '${newConfig.value.config.meta?.appName}' at ${pocketbasePath}`
    );
  }
}
