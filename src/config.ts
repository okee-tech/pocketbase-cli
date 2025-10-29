import TOML from "@iarna/toml";
import { err, ok, Result } from "neverthrow";
import fs from "node:fs";
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

type SettingsSchemaConfig = z.infer<typeof SettingsSchema>;

function parseConfig(configPath: string): Result<SettingsSchemaConfig, Error> {
  const rawConfigResult = Result.fromThrowable(() =>
    fs.readFileSync(configPath, "utf-8")
  )();
  if (rawConfigResult.isErr()) return err(rawConfigResult.error as Error);

  const tomlResult = Result.fromThrowable(() =>
    TOML.parse(rawConfigResult.value)
  )();
  if (tomlResult.isErr()) return err(tomlResult.error as Error);
  const injected = injectEnv(tomlResult.value);
  const schemaResult = Result.fromThrowable(() =>
    SettingsSchema.parse(injected)
  )();
  if (schemaResult.isErr()) return err(schemaResult.error as Error);

  return ok(schemaResult.value);
}

const SuperuserConfigSchema = z.object({
  email: z.email(),
  password: z.string(),
});

const UserConfigSchema = z.object({
  email: z.email(),
  password: z.string(),
  name: z.string().optional(),
});

const SettingsSchema = z.object({
  appName: z.string().default("pocketbase-app"),

  bindPort: z.int().default(55432),

  superusers: SuperuserConfigSchema.array().default([
    {
      email: "admin@inbucket.local",
      password: "password",
    },
  ]),
  users: UserConfigSchema.array().default([
    {
      email: "test@inbucket.local",
      password: "password",
      name: "Test User",
    },
  ]),
});

export { parseConfig, SettingsSchema, SettingsSchemaConfig };
