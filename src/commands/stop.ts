import { Command } from "@oclif/core";
import chalk from "chalk";
import * as compose from "docker-compose";
import { ResultAsync } from "neverthrow";
import path from "node:path";
import { getProject } from "../get-project.js";

export default class Stop extends Command {
  static override args = {};
  static override description = "Stop PocketBase server";
  static override examples = ["<%= config.bin %> <%= command.id %>"];
  static override flags = {};

  public async run(): Promise<void> {
    await this.parse(Stop);

    const projectResult = getProject();
    if (projectResult.isErr())
      this.error(chalk.red(`Project not found: ${projectResult.error}`));
    const project = projectResult.value;
    const pbConfig = project.config;
    const projectName = pbConfig.meta?.appName;
    if (projectName == null)
      this.error(
        chalk.red("Cannot determine project name from config.meta.appName")
      );

    this.log(
      `Located PocketBase: ${chalk.cyanBright(projectName)}, at ${chalk.italic(
        project.projectRoot
      )}`
    );

    const compoaseDown = await ResultAsync.fromThrowable(() =>
      compose.down({
        cwd: path.join(project.projectRoot, "pocketbase", ".pb"),
        log: false,
        composeOptions: ["--project-name", projectName],
      })
    )();
    if (compoaseDown.isErr())
      this.error(
        chalk.red(
          `Failed to stop existing PocketBase Docker containers: ${compoaseDown.error}`
        )
      );

    this.log(chalk.green("PocketBase Docker containers stopped."));
  }
}
