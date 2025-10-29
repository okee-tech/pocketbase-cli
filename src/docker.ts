import Docker from "dockerode";
import { err, ok, Result, ResultAsync } from "neverthrow";
import { Project } from "./get-project.js";
import { DOCKER_IMAGES } from "./utils.js";

export async function checkDocker(
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
        label: [`com.docker.compose.project=${project.config.meta?.appName}`],
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

export { areAllRunning };
