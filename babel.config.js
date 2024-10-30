module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }], // Target the current Node version
    '@babel/preset-typescript' // Add TypeScript support
  ]
};
