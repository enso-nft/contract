module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  plugins: ["@typescript-eslint", "promise", "import"],
  extends: [
    "standard",
    "plugin:node/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:promise/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      { ignores: ["modules"] },
    ],
    "node/no-missing-import": "off",
    "node/no-unpublished-import": "off",
    "no-unused-expressions": "off",
  },
};
