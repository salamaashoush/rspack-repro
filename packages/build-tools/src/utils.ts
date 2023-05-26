import type { Mode, Target } from '@rspack/core';
import type { Config } from '@swc/core';
import { existsSync, readdirSync } from 'fs';
import { match } from 'minimatch';
import { dirname } from 'path';

import { PathMap } from './types';

export const getMode = (): Mode => {
  const mode: string = process.env.WEBPACK_MODE || process.env.NODE_ENV || 'production';
  if (mode !== 'production' && mode !== 'development' && mode !== 'none') {
    throw new Error(`Invalid Webpack mode: '${mode}'`);
  }

  return mode;
};


/**
 * Returns the path to the package
 * @param pkg - package name like '@quin/build-tools'
 */
export function resolvePackagePath(pkg: string) {
  return dirname(require.resolve(`${pkg}/package.json`));
}

export function getDependencies(pkg: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { dependencies } = require(require.resolve(`${pkg}/package.json`));

  return Object.keys(dependencies);
}

interface BindModuleAssetsOptions {
  /**
   * scope assets to module name, it creates a folder with the module name under the destination
   * @default false
   */
  scope?: boolean;
  /**
   * path to the assets folder inside the module, we copy everything inside this folder and merge it with the assets of the app
   * @default 'static'
   */
  assetsPath?: string;
  /**
   * base destination path to copy the assets to
   * @default ''
   */
  baseDestination?: string;
  /**
   * base path to resolve the app dependencies from and to evaluate the glob pattern
   * @default process.cwd()
   */
  basePath?: string;
}

/**
 * Returns a path map of assets to copy from a module to the build folder of the app
 * it merges the assets and can scope them to the module name, and for locales it always merges them in a way that i18next http backend can find them
 * @param module module name like '@quin/build-tools' or glob pattern like '@quin/patient-web-portal-*'
 */
export function bindModuleAssets(
  module: string,
  { scope = false, assetsPath = 'static', baseDestination, basePath = process.cwd() }: BindModuleAssetsOptions = {},
): PathMap {
  // check if module is a glob pattern
  if (module.includes('*') || module.includes('?')) {
    const dependencies = getDependencies(basePath);
    const matched = match(dependencies, module);
    return matched.reduce((acc, pkg) => ({ ...acc, ...bindModuleAssets(pkg) }), {});
  }

  const packageName = module.split('/')[1];
  const packagePath = resolvePackagePath(module);
  const from = `${packagePath}/${assetsPath}`;
  const found = existsSync(from);
  if (!found) {
    return {};
  }
  const resources = readdirSync(from);
  const bindings: PathMap = {};
  for (const resource of resources) {
    if (resource === 'locales') {
      const langs = readdirSync(`${from}/locales`);
      // map locales to match i18next http backend format '/locales/{{lng}}/{{ns}}.json'
      for (const lang of langs) {
        bindings[`${from}/locales/${lang}/translation.json`] = `locales/${lang}/${packageName}.json`;
      }
    } else {
      const path = `${resource}/${scope ? packageName : ''}`;
      bindings[`${from}/${resource}`] = baseDestination ? `${baseDestination}/${path}` : path;
    }
  }
  return bindings;
}

// like String.prototype.search but returns the last index
function searchLast(str: string, rgx: RegExp) {
  const matches = Array.from(str.matchAll(rgx));
  return matches.length > 0 ? matches.slice(-1)[0]?.index : -1;
}

// mostly copied from https://github.com/motdotla/dotenv-expand/blob/master/lib/main.js#L4
export function interpolate(envValue: string, environment: NodeJS.ProcessEnv): string {
  // find the last unescaped dollar sign in the
  // value so that we can evaluate it
  const lastUnescapedDollarSignIndex = searchLast(envValue, /(?!(?<=\\))\$/g);

  // If we couldn't match any unescaped dollar sign
  // let's return the string as is
  if (lastUnescapedDollarSignIndex === -1) {
    return envValue;
  }

  // This is the right-most group of variables in the string
  const rightMostGroup = envValue.slice(lastUnescapedDollarSignIndex);

  /**
   * This finds the inner most variable/group divided
   * by variable name and default value (if present)
   * (
   *   (?!(?<=\\))\$        // only match dollar signs that are not escaped
   *   {?                   // optional opening curly brace
   *     ([\w]+)            // match the variable name
   *     (?::-([^}\\]*))?   // match an optional default value
   *   }?                   // optional closing curly brace
   * )
   */
  const matchGroup = /((?!(?<=\\))\${?([\w]+)(?::-([^}\\]*))?}?)/;
  const match = rightMostGroup.match(matchGroup);

  if (match != null) {
    const [, group, variableName, defaultValue] = match;
    const replacement = environment[variableName ?? ''] || defaultValue || '';
    if (group && replacement) {
      return interpolate(envValue.replace(group, replacement), environment);
    }
  }
  return envValue;
}

export function isMainThreadElectron(target: Target) {
  return typeof target === 'string' && target.startsWith('electron') && target.endsWith('main');
}
