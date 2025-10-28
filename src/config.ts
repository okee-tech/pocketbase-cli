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

const EmailTemplateSchema = z.object({
  body: z.string().optional(),
  subject: z.string().optional(),
  actionUrl: z.string().optional(),
});

const MetaConfigSchema = z.object({
  appName: z.string().optional(),
  appUrl: z.string().optional(),
  hideControls: z.boolean().optional(),
  senderName: z.string().optional(),
  senderAddress: z.string().optional(),
  verificationTemplate: EmailTemplateSchema.optional(),
  resetPasswordTemplate: EmailTemplateSchema.optional(),
  confirmEmailChangeTemplate: EmailTemplateSchema.optional(),
});

const S3ConfigSchema = z.object({
  enabled: z.boolean().optional(),
  bucket: z.string().optional(),
  region: z.string().optional(),
  endpoint: z.string().optional(),
  accessKey: z.string().optional(),
  secret: z.string().optional(),
  forcePathStyle: z.boolean().optional(),
});

const SMTPConfigSchema = z.object({
  enabled: z.boolean().optional(),
  host: z.string().optional(),
  port: z.number().int().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  authMethod: z.string().optional(), // "PLAIN" or "LOGIN"
  tls: z.boolean().optional(),
  localName: z.string().optional(),
});

const BackupsConfigSchema = z.object({
  cron: z.string().optional(),
  cronMaxKeep: z.number().int().optional(),
  s3: S3ConfigSchema.optional(),
});

const BatchConfigSchema = z.object({
  enabled: z.boolean().optional(),
  maxRequests: z.number().int().optional(),
  timeout: z.number().int().optional(),
  maxBodySize: z.number().int().optional(),
});

const LogsConfigSchema = z.object({
  maxDays: z.number().int().optional(),
  minLevel: z.number().int().optional(),
  logIp: z.boolean().optional(),
});

const RateLimitRuleSchema = z.object({
  label: z.string().optional(),
  audience: z.string().optional(), // "", "guest", or "auth"
  duration: z.number().int().optional(),
  maxRequests: z.number().int().optional(),
});

const RateLimitsConfigSchema = z.object({
  enabled: z.boolean().optional(),
  rules: z.array(RateLimitRuleSchema).optional(),
});

const TrustedProxyConfigSchema = z.object({
  headers: z.array(z.string()).optional(),
  useLeftmostIP: z.boolean().optional(),
});

export const SettingsSchema = z.object({
  backups: BackupsConfigSchema.optional(),
  batch: BatchConfigSchema.optional(),
  logs: LogsConfigSchema.optional(),
  meta: MetaConfigSchema.optional(),
  rateLimits: RateLimitsConfigSchema.optional(),
  s3: S3ConfigSchema.optional(),

  smtp: SMTPConfigSchema.optional(),
  trustedProxy: TrustedProxyConfigSchema.optional(),
});

export { parseConfig, SettingsSchemaConfig };
