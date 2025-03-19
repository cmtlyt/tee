import antfu from '@antfu/eslint-config';

export default antfu({
  type: 'lib',
  pnpm: true,
  formatters: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: true,
  },
}, {
  rules: {
    'ts/explicit-function-return-type': 'off',
  },
});
