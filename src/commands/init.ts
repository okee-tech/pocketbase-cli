import { Command } from "@oclif/core";

import { getConfig } from "../get-config.js";

export default class Init extends Command {
  static override args = {};
  static override description =
    "Initialized PocketBase project in current directory";
  static override examples = ["<%= config.bin %> <%= command.id %>"];
  static override flags = {};

  public async run(): Promise<void> {
    await this.parse(Init);

    const currentPath = process.cwd();
    const config = getConfig();
    if (config.isOk() && config.value.projectRoot == currentPath)
      this.error("Project is already initialized in this directory");

    // Create a project
  }
}
