import Docker from "dockerode";
import { err, ok, Result, ResultAsync } from "neverthrow";

export async function checkDocker(
  docker = new Docker()
): Promise<Result<void, Error>> {
  const pingResult = await ResultAsync.fromThrowable(() => docker.ping())();
  if (pingResult.isErr()) return err(pingResult.error as Error);

  return ok(undefined);
}
