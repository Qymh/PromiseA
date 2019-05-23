const typescript = require('rollup-plugin-typescript');

module.exports = {
  input: 'src/promiseA+.ts',
  output: {
    name: 'MyPromise',
    file: 'dist/promiseA+_ts.js',
    format: 'umd'
  },
  plugins: [typescript()]
};
