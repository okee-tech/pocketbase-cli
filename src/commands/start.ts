import { Command } from "@oclif/core";
import chalk from "chalk";
import * as compose from "docker-compose";
import Docker from "dockerode";
import { Result, ResultAsync } from "neverthrow";
import fs from "node:fs";
import path from "node:path";
import { areAllRunning, checkDocker, getStatusString } from "../docker.js";
import { getProject } from "../get-project.js";
import { initPb } from "../init-pb.js";

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

    const projectResult = getProject();
    if (projectResult.isErr())
      this.error(chalk.red(`Project not found: ${projectResult.error}`));
    const project = projectResult.value;
    const pbConfig = project.config;
    const projectName = pbConfig.appName;

    this.log(
      `Located PocketBase: ${chalk.cyanBright(projectName)}, at ${chalk.italic(
        project.projectRoot
      )}`
    );

    const hasConfigChanged = await initPb(project);
    if (hasConfigChanged.isErr())
      this.error(
        chalk.red(
          `Failed to apply config to PocketBase: ${hasConfigChanged.error}`
        )
      );

    if (!hasConfigChanged.value) {
      const areAllRunningResult = await areAllRunning(project, docker);
      if (areAllRunningResult.isOk() && areAllRunningResult.value)
        return this.log(chalk.green("PocketBase Docker is already running."));
    }

    this.log(
      chalk.yellow("Detected configuration changes, reseting pocketbase")
    );

    const dataRmResult = Result.fromThrowable(() =>
      fs.rmSync(
        path.join(project.projectRoot, "pocketbase", ".pb", "pb_data"),
        {
          recursive: true,
          force: true,
        }
      )
    )();
    if (dataRmResult.isErr())
      this.error(
        chalk.red(
          `Failed to clear PocketBase data directory: ${dataRmResult.error}`
        )
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

    const composeUpResult = await ResultAsync.fromThrowable(() =>
      compose.upAll({
        cwd: path.join(project.projectRoot, "pocketbase", ".pb"),
        log: false,
        composeOptions: ["--project-name", projectName],
      })
    )();
    if (composeUpResult.isErr())
      this.error(
        chalk.red(
          `Failed to start PocketBase Docker containers: ${composeUpResult.error}`
        )
      );

    this.log(chalk.green("PocketBase Docker containers started successfully."));

    const statusString = await getStatusString(project);
    if (statusString.isErr())
      this.error(
        chalk.red(`Failed to retrieve PocketBase status: ${statusString.error}`)
      );

    this.log(statusString.value);
  }
}
