import { Command } from "@oclif/core";

export default class Migrate extends Command {
  static override args = {};
  static override description = "describe the command here";
  static override examples = ["<%= config.bin %> <%= command.id %>"];
  static override flags = {};

  public async run(): Promise<void> {
    await this.parse(Migrate);

    this.error("Not implemented yet");
  }
}
