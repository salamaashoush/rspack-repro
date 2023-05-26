import type { Configuration } from '@rspack/core';

import { createBaseConfig } from './createBaseConfig';
import type { LibConfigOptions } from './types';
import { getMode } from './utils';

export function createLibConfig(config: LibConfigOptions, mode = getMode()): Configuration {
  const baseConfig: Configuration = createBaseConfig(config, mode);
  const { library, filename = '[name].js', globalObject = 'this' } = config;
  return {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      library,
      filename,
      globalObject,
    },
  };
}
