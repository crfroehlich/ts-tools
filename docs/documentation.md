# Documentation Tooling

This project provides a number of tools to streamline your project's documentation. To use these tools, add protect-tools-js to your project as a dev dependency.

- Install `yarn add dev @ns8/protect-tools-js`

## Table of Contents

- [Documentation Tooling](#documentation-tooling)
  - [Standardize](#standardize)
    - [Standardize Usage](#standardize-usage)
  - [API](#api)
    - [API Usage](#api-usage)
  - [API Markdown](#api-markdown)
    - [API Markdown Usage](#api-markdown-usage)

## Standardize

The `standardize` method performs a number of aesthetic and organization operations on your projects Markdown documentation.

- Creates an index of every Markdown file and inserts this into your `README.md`
- Creates a Table of Contents for each Markdown file that has more than one header
- Inserts a License block into `README.md`
- Automatically lints and applies fixes to all your project's Markdown files

### Standardize Usage

To use this tool, install the package and add a build script to your `package.json`

- In `package.json`, add `"docs:standardize": "standardizeReadme",`. It is recommended to run this as part of your project's build or as a pre-commit hook so that changes to documentation are automatically folded into your current commit.

## API

The [`generateApi` method](../src/docs/generateApi.ts) generates API documentation for your project suitable to publishing to NPM and including in your project's documentation. This is based on Microsoft's [API Extractor](https://api-extractor.com/).

- A single, fully documented `.d.ts` definition is generated for your entire project, placed in your `/dist` folder along with your other build artifacts. This file should not be committed to VCS.
- A `project-api.md` file is generated inside your projects `/docs` folder. As your publicly defined classes, interfaces, enums and methods change--this file will automatically update allowing code reviewers to quickly spot changes to the signature of the public facing API and determine the risk of regressions. This file should be committed and tracked in VCS, and this document can provide guidance to external consumers of your API.
- When changes to your public API are detected, a build warning is issued: `Warning: You have changed the public API signature for this project. Updating docs/project-api.md`

### API Usage

To use this tool, install the package and add a build script to your `package.json`

- In `package.json`, add `"docs:api": "generateApi",`

## API Markdown

The [`generateApiDocs` method](../src/docs/generateApiDocs.ts) generates end-to-end documentation for every file, class, method, interface, type and enum in your project in a format suitable to pushing to a website, such as GitHub Pages. This documentation is suitable for external consumers who want to access the full context of all your project's code documentation in an easy to explore way. Running this tool will generate a suite of Markdown files in your project's `/api` folder. When run from CI, this will also publish the results to the `gh-pages` branch of your project.

### API Markdown Usage

To use this tool, install the package and add a build script to your `package.json`

- In `package.json`, add `"docs:api:markdown": "generateApiDocs",`
