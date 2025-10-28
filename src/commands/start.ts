import { Command } from "@oclif/core";
import chalk from "chalk";
import * as compose from "docker-compose";
import Docker from "dockerode";
import { ResultAsync } from "neverthrow";
import path from "path";
import { checkDocker } from "../check-docker.js";
import { DOCKER_IMAGES } from "../docker.js";
import { getConfig } from "../get-config.js";

export default class Start extends Command {
  static override args = {};
  static override description = "Start PocketBase server";
  static override examples = ["<%= config.bin %> <%= command.id %>"];
  static override flags = {};

  public async run(): Promise<void> {
    await this.parse(Start);

    const docker = new Docker();
    const checkResult = await checkDocker(docker);
    if (checkResult.isErr())
      this.error(
        chalk.red(
          `Docker does not appear to be running: ${checkResult.error.message}`
        )
      );

    const configResult = getConfig();
    if (configResult.isErr()) this.error(configResult.error);
    const config = configResult.value;
    const pbConfig = config.config;
    const projectName = pbConfig.meta?.appName;
    if (projectName == null)
      this.error("Cannot determine project name from config.meta.appName");

    const dockerComposePath = path.join(
      config.projectRoot,
      "pocketbase",
      ".pb"
    );

    this.log(
      `Located PocketBase: ${chalk.cyanBright(projectName)}, at ${chalk.italic(
        config.projectRoot
      )}`
    );

    const listResult = await ResultAsync.fromThrowable(() =>
      docker.listContainers({
        all: true,
        filters: {
          label: [`com.docker.compose.project=${projectName}`],
        },
      })
    )();
    if (listResult.isErr())
      this.error(`Failed to list Docker containers: ${listResult.error}`);

    const areAllRunning =
      DOCKER_IMAGES.every(
        (pbImage) =>
          listResult.value.find((el) => pbImage == el.Names[0]) != undefined
      ) && listResult.value.every((el) => el.State == "running");

    // console.log(psOut);
  }
}
