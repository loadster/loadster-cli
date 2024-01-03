// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // add your custom rules here
  rules: {
    'generator-star-spacing': 'off', // allow async-await
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', // allow debugger during development
    'semi': [2, "always"],
    'object-curly-spacing': ['error', 'always'],
    'no-unused-vars': ['warn']
  }
};
