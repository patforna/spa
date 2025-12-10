import { join } from 'path';
import { Categoriser } from './categoriser.js';
import { CategoriseCommand } from './commands/categorise.js';
import { ClusterCommand } from './commands/cluster.js';
import { FxRateRepo, FxRateService } from './fxRates.js';
import { Output, consoleOutput } from './output.js';
import { InputParserFactory } from './parsers/index.js';
import { Rules, RulesRepo } from './rules.js';
import { OverridesRepo, Override } from './transactions.js';

const PROJECT_ROOT = process.cwd();

const OVERRIDES_PATH = join(PROJECT_ROOT, 'data/overrides.json');
const FX_RATES_PATH = join(PROJECT_ROOT, 'data/fxRates.json');
const RULES_PATH = join(PROJECT_ROOT, 'data/rules.json');

export const FX_API_KEY = process.env['FIXER_API_KEY'];
export const FX_API_URL = 'http://data.fixer.io/api/';

export class Wiring {
  readonly output: Output;
  readonly rules: Rules;
  readonly overrides: Override[];
  readonly overridesRepo: OverridesRepo;
  readonly inputParserFactory: InputParserFactory;
  readonly categoriseCommand: CategoriseCommand;
  readonly clusterCommand: ClusterCommand;

  constructor() {
    const rulesRepo = new RulesRepo(RULES_PATH);
    const fxRateService = new FxRateService(new FxRateRepo(FX_RATES_PATH));

    this.output = consoleOutput;
    this.rules = rulesRepo.load();
    this.overridesRepo = new OverridesRepo(OVERRIDES_PATH);
    this.overrides = this.overridesRepo.load();
    this.inputParserFactory = new InputParserFactory(fxRateService);

    const categoriser = new Categoriser(this.rules, this.overrides);

    this.categoriseCommand = new CategoriseCommand(
      this.rules,
      this.overrides,
      this.overridesRepo,
      categoriser
    );
    this.clusterCommand = new ClusterCommand(this.output);
  }
}
