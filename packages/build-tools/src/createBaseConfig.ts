import type { Configuration } from '@rspack/core';
import { resolve } from 'path';

import { BaseConfigOptions } from './types';
import { getMode } from './utils';

const DEFAULT_BUILD_PATH = 'build';

export function createBaseConfig(
  { basePath, buildPath = DEFAULT_BUILD_PATH, entries = {}, pathBindings = {}, plugins = [] }: BaseConfigOptions,
  mode = getMode(),
): Configuration {
  const resolvedBuildPath = resolve(basePath, buildPath);

  return {
    mode,
    entry: entries,
    output: {
      clean: true,
      path: resolvedBuildPath,
      filename: '[name].js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      // symlinks: true,
    },
    stats: 'normal',
    module: {
      rules: [
        {
          test: /\.css$/i,
          type: 'css',
        },
      ],
    },
    builtins: {
      progress: true,
      react: {
        runtime: 'automatic',
        development: mode === 'development',
        useSpread: true,
        useBuiltins: true,
        refresh: true,
      },
      copy: {
        patterns: Object.keys(pathBindings).map((from) => ({
          from,
          to: resolve(resolvedBuildPath, pathBindings[from] as string),
        })),
      },
    },
    plugins,
    experiments: {
      // incrementalRebuild: true,
      // lazyCompilation: true,
    },
  };
}
