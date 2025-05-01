import { join } from 'path';
import { Categoriser } from './categoriser.js';
import { FxRateRepo, FxRateService } from './fxRates.js';
import { ItemRepo } from './items.js';
import { InputParserFactory } from './parsers/index.js';
import { RulesRepo } from './rules.js';

const PROJECT_ROOT = process.cwd();

const OVERRIDES_PATH = join(PROJECT_ROOT, 'data/overrides.json');
const FX_RATES_PATH = join(PROJECT_ROOT, 'data/fxRates.json');

export const FX_API_KEY = process.env['FIXER_API_KEY'];
export const FX_API_URL = 'http://data.fixer.io/api/';

export class Wiring {
  readonly rulesRepo: RulesRepo;
  readonly overridesRepo: ItemRepo;
  readonly categoriser: Categoriser; // TODO replace with categoriserFor(rules, overrides)
  readonly fxRateService: FxRateService;
  readonly inputParserFactory: InputParserFactory;

  constructor() {
    this.rulesRepo = new RulesRepo();
    this.overridesRepo = new ItemRepo(OVERRIDES_PATH);
    this.fxRateService = new FxRateService(new FxRateRepo(FX_RATES_PATH));
    this.inputParserFactory = new InputParserFactory(this.fxRateService);

    // FIXME not so nice to load this in here / multiple times
    const rules = this.rulesRepo.load();
    const overrides = this.overridesRepo.load();
    this.categoriser = new Categoriser(rules, overrides);
  }
}
