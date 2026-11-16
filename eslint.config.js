// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // CSS imports are resolved by Metro/NativeWind at build time, not by ESLint statically
    rules: {
      'import/no-unresolved': ['error', { ignore: ['\\.css$'] }],
    },
  },
]);
