import type { Configuration, DevServer } from '@rspack/core';
import path from 'path';

import { createBaseConfig } from './createBaseConfig';
import { DotenvPlugin } from './DotEnvPlugin';
import type { AppConfigOptions } from './types';
import { getMode } from './utils';

// Dev server base constants
const DEV_SERVER_HOST = process.env.DEV_SERVER_HOST || '0.0.0.0';
const DEV_SERVER_PORT = parseInt(process.env.DEV_SERVER_PORT || '', 10) || 8080;
const DEV_SERVER_HTTPS = process.env.DEV_SERVER_HTTPS !== 'false';

export function createAppConfig(config: AppConfigOptions, mode = getMode()): Configuration {
  const dotenvFileName = path.resolve(config.basePath, process.env.ENVFILE || '.env');
  const baseConfig: Configuration = createBaseConfig(config, mode);

  const { proxy, basePath, entries = {}, templates = {} } = config;
  const devServer: DevServer = {
    hot: true,
    host: DEV_SERVER_HOST,
    server: DEV_SERVER_HTTPS ? 'https' : 'http',
    port: DEV_SERVER_PORT,
    static: {
      publicPath: '/',
      watch: {
        ignored: '**/generated',
      },
    },
    historyApiFallback: true,
    proxy,
  };

  const html = Object.keys(entries)
    .map((entry) => {
      const filename = `${entry}.html`;
      const template = templates[entry] ? path.resolve(basePath, templates[entry] as string) : undefined;

      return {
        filename,
        template,
        chunks: [entry],
      };
    })
    .filter(Boolean);

  return {
    ...baseConfig,
    builtins: {
      ...baseConfig.builtins,
      html: html,
    },
    devServer,
    output: {
      ...baseConfig.output,
      /* All of the assets should be served from the root when developing.
      For example for /url/subpath/id it needs to fetch from /, not from /url/subpath/ */
      publicPath: mode === 'production' ? baseConfig.output?.publicPath : '/',
      filename: '[name].[contenthash].js',
    },

    // Check the list of other available options here https://webpack.js.org/configuration/devtool/
    devtool: mode === 'production' ? 'nosources-source-map' : 'eval-cheap-module-source-map',
    watchOptions: {
      ignored: '**/generated',
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
      },
    },

    plugins: [
      ...(baseConfig.plugins ?? []),
      new DotenvPlugin({
        path: dotenvFileName,
        systemvars: true,
      }),
    ],
  };
}
