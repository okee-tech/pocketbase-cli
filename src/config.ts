import TOML from "@iarna/toml";
import fs from "fs";
import { err, ok, Result } from "neverthrow";
import process from "node:process";
import z from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function injectEnv(obj: any): any {
  if (Array.isArray(obj)) return obj.map((v) => injectEnv(v));

  if (obj && typeof obj === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) out[k] = injectEnv(v);
    return out;
  }

  if (typeof obj === "string") {
    // match env(VAR) or env(VAR, "fallback") or env(VAR, 'fallback')
    const m = obj.match(
      /^env\(\s*([A-Z0-9_]+)\s*(?:,\s*(['"`])(.+?)\2\s*)?\)$/i
    );
    if (!m) return obj;

    const [, varName, , fallback] = m;
    const envValue = process.env[varName];

    if (envValue && envValue !== undefined) return envValue;
    return fallback === undefined ? null : fallback;
  }

  return obj;
}

const schema = z.object({
  app: z.string(),
});

type Config = z.infer<typeof schema>;

function parseConfig(configPath: string): Result<Config, Error> {
  const rawConfigResult = Result.fromThrowable(() =>
    fs.readFileSync(configPath, "utf-8")
  )();
  if (rawConfigResult.isErr()) return err(rawConfigResult.error as Error);

  const tomlResult = Result.fromThrowable(() =>
    TOML.parse(rawConfigResult.value)
  )();
  if (tomlResult.isErr()) return err(tomlResult.error as Error);
  const injected = injectEnv(tomlResult.value);
  const schemaResult = Result.fromThrowable(() => schema.parse(injected))();
  if (schemaResult.isErr()) return err(schemaResult.error as Error);

  return ok(schemaResult.value);
}

export { Config, parseConfig };
