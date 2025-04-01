import { FxRateRepo, FxRateService } from './fxRates.js';
import { Categoriser } from './categoriser.js';
import { ItemRepo } from './items.js';
import { join } from 'path';
import { InputParserFactory } from './parsers/index.js';

const PROJECT_ROOT = process.cwd();

const OVERRIDES_PATH = join(PROJECT_ROOT, 'data/overrides.json');
const FX_RATES_PATH = join(PROJECT_ROOT, 'data/fxRates.json');

export const FX_API_KEY = process.env['FIXER_API_KEY'];
export const FX_API_URL = 'http://data.fixer.io/api/';

export class Wiring {
  readonly overridesRepo: ItemRepo;
  readonly categoriser: Categoriser;
  readonly fxRateService: FxRateService;
  readonly inputParserFactory: InputParserFactory;

  constructor() {
    this.overridesRepo = new ItemRepo(OVERRIDES_PATH);
    this.fxRateService = new FxRateService(new FxRateRepo(FX_RATES_PATH));
    this.categoriser = new Categoriser(this.overridesRepo.load());
    this.inputParserFactory = new InputParserFactory(this.fxRateService);
  }
}
