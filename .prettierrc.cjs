module.exports = {
  singleQuote: true,
  arrowParens: 'always',
  useTabs: false,
  tabWidth: 2,
  semi: false,
  trailingComma: 'es5',
  quoteProps: 'preserve',
  printWidth: 120,
  importOrder: ['^@/(.*)$', '^./', '^[./]'],
  importOrderParserPlugins: ['typescript'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
