import { join } from 'path';
import { Categoriser } from './categoriser.js';
import { FxRateRepo, FxRateService } from './fxRates.js';
import { OverridesRepo, Transaction, Override } from './transactions.js';
import { InputParserFactory } from './parsers/index.js';
import { Rules, RulesRepo } from './rules.js';

const PROJECT_ROOT = process.cwd();

const OVERRIDES_PATH = join(PROJECT_ROOT, 'data/overrides.json');
const FX_RATES_PATH = join(PROJECT_ROOT, 'data/fxRates.json');

export const FX_API_KEY = process.env['FIXER_API_KEY'];
export const FX_API_URL = 'http://data.fixer.io/api/';

export class Wiring {
  readonly overridesRepo: OverridesRepo;
  readonly rules: Rules;
  readonly overrides: Override[];
  readonly categoriser: Categoriser;
  readonly fxRateService: FxRateService;
  readonly inputParserFactory: InputParserFactory;

  constructor() {
    const rulesRepo = new RulesRepo();
    this.overridesRepo = new OverridesRepo(OVERRIDES_PATH);
    this.fxRateService = new FxRateService(new FxRateRepo(FX_RATES_PATH));
    this.inputParserFactory = new InputParserFactory(this.fxRateService);

    this.rules = rulesRepo.load();
    this.overrides = this.overridesRepo.load();
    this.categoriser = new Categoriser(this.rules, this.overrides);
  }
}
