/* eslint-disable n/no-unpublished-require */
const nodePlugin = require("eslint-plugin-n");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");
const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        process: "readonly",
        __dirname: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        fetch: "readonly",
        URLSearchParams: "readonly",
      },
    },
    settings: {
      n: {
        version: ">=21.0.0",
      },
    },
    plugins: {
      n: nodePlugin,
      prettier: prettierPlugin,
    },
    rules: {
      "n/no-unpublished-require": "off",
      ...nodePlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "n/no-unsupported-features/es-syntax": "off",
      "n/no-missing-require": "off", // Handled by other means or often false positive with some structures
    },
  },
];
