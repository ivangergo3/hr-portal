module.exports = {
  tabWidth: 2,
  singleQuote: true,
  semi: true,
  plugins: [require.resolve('prettier-plugin-sql')],
  overrides: [
    {
      files: '*.sql',
      options: {
        parser: 'sql',
        sqlFormat: {
          dialect: 'postgresql',
          uppercase: true,
          linesBetweenQueries: 2,
          tabWidth: 2,
        },
      },
    },
  ],
};
