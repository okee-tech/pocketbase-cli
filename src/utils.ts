import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLES_DIR = path.join(__dirname, "samples");

const SAMPLE_DOCKER_COMPOSE = fs.readFileSync(
  path.join(SAMPLES_DIR, ".pb", "docker-compose.yml"),
  "utf-8"
);
const PARSED_DOCKER_COMPOSE = YAML.parse(SAMPLE_DOCKER_COMPOSE);

const USERS_SAMPLE_MIGRATION_PATH = path.join(
  SAMPLES_DIR,
  "pb_migrations",
  "10_users.js"
);
const USERS_SAMPLE_MIGRATION = fs.readFileSync(
  USERS_SAMPLE_MIGRATION_PATH,
  "utf-8"
);

const DOCKER_IMAGES = [...Object.keys(PARSED_DOCKER_COMPOSE.services)];

export {
  DOCKER_IMAGES,
  PARSED_DOCKER_COMPOSE,
  SAMPLE_DOCKER_COMPOSE,
  SAMPLES_DIR,
  USERS_SAMPLE_MIGRATION,
  USERS_SAMPLE_MIGRATION_PATH,
};
