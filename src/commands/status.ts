import { Command } from "@oclif/core";
import chalk from "chalk";
import { getStatusString } from "../docker.js";
import { getProject } from "../get-project.js";

export default class Status extends Command {
  static override args = {};
  static override description = "Display status information";
  static override examples = ["<%= config.bin %> <%= command.id %>"];
  static override flags = {};

  public async run(): Promise<void> {
    await this.parse(Status);

    const projectResult = getProject();
    if (projectResult.isErr())
      this.error(chalk.red(`Project not found: ${projectResult.error}`));
    const project = projectResult.value;

    const statusString = await getStatusString(project);
    if (statusString.isErr())
      this.error(
        chalk.red(`Failed to retrieve PocketBase status: ${statusString.error}`)
      );

    this.log(statusString.value);
  }
}
