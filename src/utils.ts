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

const SAMPLE_SETTINGS_MIGRATION = fs.readFileSync(
  path.join(SAMPLES_DIR, "pb_migrations", "settings.js"),
  "utf-8"
);
const DOCKER_IMAGES = [...Object.keys(PARSED_DOCKER_COMPOSE.services)];

export {
  DOCKER_IMAGES,
  PARSED_DOCKER_COMPOSE,
  SAMPLE_DOCKER_COMPOSE,
  SAMPLE_SETTINGS_MIGRATION,
  SAMPLES_DIR,
};
