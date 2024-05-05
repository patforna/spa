import { FxRateRepo, FxRateService } from './fxRates.js';

const fxRateRepo = new FxRateRepo(
  '/Users/you/code/spa/data/tools/fxRates.json' // FIXME
);

export const fxRateService = new FxRateService(fxRateRepo);
