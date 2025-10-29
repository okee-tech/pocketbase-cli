import { Command } from "@oclif/core";
import chalk from "chalk";
import { Result } from "neverthrow";
import fs from "node:fs";
import path from "node:path";
import { getProject } from "../get-project.js";

export default class Reset extends Command {
  static override args = {};
  static override description =
    "Reset PocketBase server, re-applying migrations";
  static override examples = ["<%= config.bin %> <%= command.id %>"];
  static override flags = {};

  public async run(): Promise<void> {
    await this.parse(Reset);

    const projectResult = getProject();
    if (projectResult.isErr())
      this.error(chalk.red(`Project not found: ${projectResult.error}`));

    const stateRemoveResult = Result.fromThrowable(() =>
      fs.rmSync(
        path.join(
          projectResult.value.projectRoot,
          "pocketbase",
          ".pb",
          ".pbstate"
        ),
        { force: true }
      )
    )();
    if (stateRemoveResult.isErr())
      this.error(
        chalk.red(
          `Failed to remove existing PocketBase state file: ${stateRemoveResult.error}`
        )
      );

    await this.config.runCommand("start");
  }
}
