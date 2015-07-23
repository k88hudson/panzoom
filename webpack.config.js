module.exports = {
  entry: {
    demo: './dist/demo/demo.js',
    tests: './panzoom.test.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].bundle.js'
  }
};
