import chalk from "chalk";
import Docker from "dockerode";
import { err, ok, Result, ResultAsync } from "neverthrow";
import { Project } from "./get-project.js";
import { DOCKER_IMAGES } from "./utils.js";

async function checkDocker(
  docker = new Docker()
): Promise<Result<void, Error>> {
  const pingResult = await ResultAsync.fromThrowable(() => docker.ping())();
  if (pingResult.isErr()) return err(pingResult.error as Error);

  return ok(undefined);
}

async function areAllRunning(
  project: Project,
  docker = new Docker()
): Promise<Result<boolean, Error>> {
  const listResult = await ResultAsync.fromThrowable(() =>
    docker.listContainers({
      all: true,
      filters: {
        label: [`com.docker.compose.project=${project.config.appName}`],
      },
    })
  )();
  if (listResult.isErr()) return err(listResult.error as Error);

  const areAllRunning =
    DOCKER_IMAGES.every(
      (pbImage) =>
        listResult.value.find(
          (el) => pbImage == el.Labels["com.docker.compose.service"]
        ) != undefined
    ) && listResult.value.every((el) => el.State == "running");

  return ok(areAllRunning);
}

async function getStatusString(
  project: Project
): Promise<Result<string, Error>> {
  let status = "";

  const areAllRunningResult = await areAllRunning(project);
  if (areAllRunningResult.isErr())
    return err(areAllRunningResult.error as Error);

  status += `\nRunning instance ${chalk.cyanBright(
    project.config.appName
  )}, location: ${chalk.italic(project.projectRoot)}\n`;
  status += chalk.green("All services are running.\n");
  status += `Admin UI:\t${chalk.cyanBright(
    chalk.underline(`http://127.0.0.1:${project.config.bindPort}/_/`)
  )}\n`;
  status += `API     :\t${chalk.cyanBright(
    chalk.underline(`http://127.0.0.1:${project.config.bindPort}/api/`)
  )}\n`;
  status += `Superusers:\n`;
  project.config.superusers?.forEach((su) => {
    status += ` - ${chalk.cyanBright(su.email)}\t:\t${chalk.cyan(
      su.password
    )}\n`;
  });
  status += "Users:\n";
  project.config.users?.forEach((user) => {
    status += ` - ${chalk.cyanBright(user.email)}\t:\t${chalk.cyan(
      user.password
    )}\n`;
  });

  return ok(status);
}

export { areAllRunning, checkDocker, getStatusString };
