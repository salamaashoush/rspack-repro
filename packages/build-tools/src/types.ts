import type { Library, Plugins } from '@rspack/core';
import type { ProxyConfigMap } from 'webpack-dev-server';

export type PathMap = Record<string, string>;

export type BaseConfigOptions = {
  basePath: string;
  buildPath?: string;
  entries?: PathMap | string;
  pathBindings?: PathMap;
  typesPath?: string;
  name: string;
  plugins?: Plugins;
};

export interface AppConfigOptions extends BaseConfigOptions {
  proxy?: ProxyConfigMap;
  templates?: PathMap;
}

export interface LibConfigOptions extends BaseConfigOptions {
  library: Library;
  filename?: string;
  globalObject?: string;
}
