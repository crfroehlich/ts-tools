# Environment Variables

This project uses [dotenv-extended](https://github.com/keithmorris/node-dotenv-extended) to load environment variables. By using `ts-tools`, you do not need to include additional libraries to load env vars, as this can be done for you automatically:

```ts
import { loadEnv } from `ts-tools`;
const env = loadEnv();
```

This decouples your project from the explicit developer dependency on the env var tool. Using `loadEnv` to init your environment variables has a number of additional benefits.

- Schema validation
- Default values
- Flexible configuration options
- Self-documenting README, see [docs](documentation.md)

## Table of Contents

- [Environment Variables](#environment-variables)
  - [Schema](#schema)
  - [Default Values](#default-values)
  - [Validation](#validation)

## Schema

Your project should include a `.env.schema` file, which should define every environment variable you intend to use with an optional regex for validating values. For example:

```bash
NODE_ENV=[a-z]+
API_TOKEN=
```

This schema file should be committed and tracked in VCS. For more details on configuring your schema, see [dotenv-extended schema](https://github.com/keithmorris/node-dotenv-extended#examples)

## Default Values

Your project should also include a `.env.defaults` file, which should define every environment variable from `.env.schema` which should have a default value. For example:

```bash
NODE_ENV=dev
```

This defaults file should be committed and tracked in VCS. If no `.env` file is present, the `.env.defaults` will be used for all variables. If a `.env` file exists and does not define a variable, the default value from `.env.defaults` will be used. If `.env` exists and defines all variables and values, the `.env.defaults` is ignored.

## Validation

A few important things happen when loading your environment variables:

```ts
import { loadEnv } from `ts-tools`;
const env = loadEnv();
```

- When `loadEnv` is invoked, if a variable is defined in `.env.schema` and no value is defined in either `.env.defaults` or `.env`, an exception will be thrown stating the variable is missing a value.
- If the loaded value does not match the specific regex from `.env.schema`, a validation error will be thrown.
- If either `.env` or `.env.defaults` defines variables that do not exist in `.env.schema`, an exception will be thrown.
  This validation ensures that changes to environment variables over time never leave a developer's local environment in an inconsistent state.
