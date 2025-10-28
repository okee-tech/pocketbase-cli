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

    const config = getConfig();
    if (config.isErr())
      this.error(`Failed to get config: ${config.error.message}`);

    this.log("Initialization successful!: ", config.value);

    // if (config != null) console.log("");
  }
}
