// import path from "path";
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const isRunningWebpack = !!process.env.WEBPACK;
// const isRunningRspack = !!process.env.RSPACK;
// if (!isRunningRspack && !isRunningWebpack) {
//   throw new Error("Unknown bundler");
// }

// const mode = "production";
// /**
//  * @type {import('webpack').Configuration | import('@rspack/cli').Configuration}
//  */
// const config = {
//   mode,
//   entry: {
//     main: "./src/index.tsx",
//   },
//   builtins: {
//     progress: true,
//     react: {
//       runtime: 'automatic',
//       development: mode === 'development',
//       useSpread: true,
//       useBuiltins: true,
//       refresh: true,
//     },
//     html: [{
//       filename: 'index.html',
//       template: path.resolve(__dirname, './index.html'),
//       chunks: ['main'],
//     }]
//   },
//   module: {
//     rules: [
//       // {
//       //   test: /\.js$/,
//       //   resourceQuery: /raw/,
//       //   type: "asset/source",
//       // },
//       {
//         test: /\.css$/,
//         type: "css",
//       },
//     ],
//   },

//   output: {
//     clean: true,
//     path: isRunningWebpack
//       ? path.resolve(__dirname, "webpack-dist")
//       : path.resolve(__dirname, "rspack-dist"),
//     publicPath: '/',
//     filename: '[name].[contenthash].js',
//   },
//   watchOptions: {
//     ignored: '**/generated',
//   },
//   optimization: {
//     runtimeChunk: 'single',
//     splitChunks: {
//       chunks: 'all',
//     },
//   },
//   resolve: {
//     extensions: ['.ts', '.tsx', '.js', '.jsx'],
//     alias: {
//       "./answer": path.resolve(__dirname, "./src/answer.js?raw"),
//     },
//   },
// };

// export default config;

import { createAppConfig } from '@rspack-repro/build-tools';

const config = (_, args) =>
  createAppConfig(
    {
      name: '@rspack-repro/app',
      basePath: process.cwd(),
      entries: {
        index: './src/index',
      },
      templates: {
        index: './index.html',
      },
      pathBindings: {
        'static/meta': '.'
      },
    },
    args.mode,
  );

module.exports = config;
