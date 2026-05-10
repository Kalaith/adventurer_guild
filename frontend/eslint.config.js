import { createWebHatcheryEslintConfig } from '../../tools/shared/frontend/eslint.config.js';

export default createWebHatcheryEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  testFiles: ['test/**/*.{ts,tsx}', 'src/test/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
});
