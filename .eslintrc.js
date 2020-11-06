module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    browser: true
  },
  extends: ["airbnb-base"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12
  },
  plugins: ["@typescript-eslint"],
  rules: {
    quotes: ["error", "double"],
    "comma-dangle": ["error", "never"],
    "operator-linebreak": ["error", "after"],
    "class-methods-use-this": "off",
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "implicit-arrow-linebreak": "off",
    "function-paren-newline": "off"
  }
};
