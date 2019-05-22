const babel = require('rollup-plugin-babel');
module.exports = {
  input: 'src/promiseA+.js',
  output: {
    name: 'MyPromise',
    file: 'dist/promiseA+_js.js',
    format: 'umd'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
