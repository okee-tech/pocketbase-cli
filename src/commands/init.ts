import { Command } from "@oclif/core";

import TOML from "@iarna/toml";
import chalk from "chalk";
import { Result } from "neverthrow";
import fs from "node:fs";
import path from "node:path";
import { SettingsSchema } from "../config.js";
import { getProject } from "../get-project.js";
import { SAMPLES_DIR } from "../utils.js";

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
      this.error(
        chalk.yellow(
          "PocketBase project already initialized in this directory."
        )
      );

    const currentProjectName = path.basename(currentPath);

    const initResult = Result.fromThrowable(() => {
      fs.mkdirSync(pocketbasePath, { recursive: true });
      fs.cpSync(SAMPLES_DIR, pocketbasePath, { recursive: true });

      const defaultConfig = SettingsSchema.parse({});
      defaultConfig.meta ??= {};
      defaultConfig.meta.appName = currentProjectName;

      fs.writeFileSync(configPath, TOML.stringify(defaultConfig), "utf-8");
      fs.writeFileSync(
        path.join(pocketbasePath, ".gitignore"),
        ".pb\n",
        "utf-8"
      );
    })();

    if (initResult.isErr())
      this.error(
        chalk.red(
          `Failed to initialize PocketBase project: ${initResult.error}`
        )
      );

    const newProject = getProject();
    if (newProject.isErr())
      this.error(chalk.red(`Failed to parse new config: ${newProject.error}`));

    this.log(
      `Initialized PocketBase project '${chalk.cyanBright(
        newProject.value.config.meta?.appName
      )}' at ${chalk.italic(pocketbasePath)}`
    );
  }
}
