const envExtended = require('dotenv-extended');

export interface EnvConfig {
  encoding?: string;
  silent?: boolean;
  path?: string;
  defaults?: string;
  schema?: string;
  errorOnMissing?: boolean;
  errorOnExtra?: boolean;
  errorOnRegex?: boolean;
  includeProcessEnv?: boolean;
  assignToProcessEnv?: boolean;
  overrideProcessEnv?: boolean;
}

export const EnvConfigDefaults: EnvConfig = {
  encoding: 'utf8',
  silent: true,
  path: '.env',
  defaults: '.env.defaults',
  schema: '.env.schema',
  errorOnMissing: false,
  errorOnExtra: false,
  errorOnRegex: false,
  includeProcessEnv: false,
  assignToProcessEnv: true,
  overrideProcessEnv: false,
};

/**
 * This will load the `.env` file onto the current process.
 * Missing properties will be loaded from `.env.defaults` if possible.
 * If no defaults exist and the properties are defined in `.env.schema`,
 * but are missing from `.env`, an error will be thrown with the missing
 * property name.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadEnv = (config: EnvConfig = EnvConfigDefaults): any => {
  return envExtended.load(config);
};
