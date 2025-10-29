import hash from "hash-sum";
import { Result, err, ok } from "neverthrow";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { Project } from "./get-project.js";
import { PARSED_DOCKER_COMPOSE, USERS_SAMPLE_MIGRATION } from "./utils.js";

type HasStateChanged = boolean;

// applies project to the PocketBase instance
export async function initPb(
  project: Project
): Promise<Result<HasStateChanged, Error>> {
  const pbBase = path.join(project.projectRoot, "pocketbase", ".pb");
  let pbStateValue = "";

  const dockerComposeUpdate = Result.fromThrowable(() => {
    const parsedDocker = { ...PARSED_DOCKER_COMPOSE };

    parsedDocker.services.pocketbase.ports[0] = `${project.config.bindPort}:8080`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.values(parsedDocker.services).forEach((service: any) => {
      service.container_name = `${service.container_name}_${project.config.appName}`;
    });

    const newDockerCompose = YAML.stringify(parsedDocker);

    fs.writeFileSync(
      path.join(pbBase, "docker-compose.yml"),
      newDockerCompose,
      "utf-8"
    );

    pbStateValue += newDockerCompose;
  })();
  if (dockerComposeUpdate.isErr())
    return err(dockerComposeUpdate.error as Error);

  const usersMigrationResult = Result.fromThrowable(() => {
    const newMigration = USERS_SAMPLE_MIGRATION.replaceAll(
      `[{ email: "super", password: "user" }]`,
      JSON.stringify(project.config.superusers)
    ).replaceAll(
      `[{ email: "super", password: "user" }]`,
      JSON.stringify(project.config.users)
    );

    fs.writeFileSync(
      path.join(
        project.projectRoot,
        "pocketbase",
        "pb_migrations",
        "10_users.js"
      ),
      newMigration,
      "utf-8"
    );

    pbStateValue += newMigration;
  })();
  if (usersMigrationResult.isErr())
    return err(usersMigrationResult.error as Error);

  const initialMigrationUpdate = Result.fromThrowable(() => {})();
  if (initialMigrationUpdate.isErr())
    return err(initialMigrationUpdate.error as Error);

  const hasHashChangedResult = Result.fromThrowable(() => {
    const currentHash = hash(pbStateValue);
    const oldHash = Result.fromThrowable(() =>
      fs.readFileSync(path.join(pbBase, ".pbstate"), "utf-8")
    )().unwrapOr(undefined);

    fs.writeFileSync(path.join(pbBase, ".pbstate"), currentHash, "utf-8");

    return currentHash !== oldHash;
  })();
  if (hasHashChangedResult.isErr())
    return err(hasHashChangedResult.error as Error);

  return ok(hasHashChangedResult.value);
}
