import { join } from 'path';
import { Categoriser } from './categoriser.js';
import {
  CategoriseCommand,
  defaultPrompter,
  Prompter,
} from './commands/categorise.js';
import { ClusterCommand } from './commands/cluster.js';
import { FxRateRepo, FxRateService } from './fxRates.js';
import { App } from './main.js';
import { Output, consoleOutput } from './output.js';
import { InputParserFactory } from './parsers/index.js';
import { Rules, RulesRepo } from './rules.js';
import { OverridesRepo, Override, TxLoader } from './transactions.js';

// Where rules, overrides and cached FX rates live. Defaults to ./data, which
// is git-ignored and seeded by copying examples/. Point SPA_DATA_DIR at your
// own directory to keep personal data outside the repo entirely.
export const DATA_DIR =
  process.env['SPA_DATA_DIR'] ?? join(process.cwd(), 'data');

const DEFAULT_OVERRIDES_PATH = join(DATA_DIR, 'overrides-common.json');
const DEFAULT_FX_RATES_PATH = join(DATA_DIR, 'fxRates.json');
const DEFAULT_RULES_PATH = join(DATA_DIR, 'rules.json');

export const FX_API_KEY = process.env['FIXER_API_KEY'];
export const FX_API_URL = 'http://data.fixer.io/api/';

// Built on first use, not at import time: loading it eagerly meant importing
// this module read the FX cache off disk, so even `spa --help` needed a data
// directory to exist.
let defaultFxRateService: FxRateService | undefined;

function getDefaultFxRateService(): FxRateService {
  defaultFxRateService ??= new FxRateService(
    new FxRateRepo(DEFAULT_FX_RATES_PATH)
  );
  return defaultFxRateService;
}

export interface WiringConfig {
  rulesPath?: string;
  overridesPath?: string;
  prompter?: Prompter;
  fxRateService?: FxRateService;
  nonInteractive?: boolean;
  output?: Output;
}

export class Wiring {
  readonly app: App;
  readonly output: Output;
  readonly txLoader: TxLoader;
  readonly inputParserFactory: InputParserFactory;
  readonly categoriseCommand: CategoriseCommand;
  readonly clusterCommand: ClusterCommand;
  readonly overridesRepo: OverridesRepo;
  readonly rules: Rules;
  readonly overrides: Override[];

  constructor(config: WiringConfig = {}) {
    const {
      rulesPath = DEFAULT_RULES_PATH,
      overridesPath = DEFAULT_OVERRIDES_PATH,
      prompter = defaultPrompter,
      fxRateService = getDefaultFxRateService(),
      nonInteractive = false,
      output = consoleOutput,
    } = config;

    const rulesRepo = new RulesRepo(rulesPath);

    this.output = output;
    this.rules = rulesRepo.load();
    this.overridesRepo = new OverridesRepo(overridesPath);
    this.overrides = this.overridesRepo.load();
    this.inputParserFactory = new InputParserFactory(fxRateService);
    this.txLoader = new TxLoader(this.inputParserFactory, this.overrides);
    this.app = new App(this.txLoader);

    const categoriser = new Categoriser(this.rules, this.overrides);

    this.categoriseCommand = new CategoriseCommand(
      this.rules,
      this.overrides,
      this.overridesRepo,
      categoriser,
      prompter,
      nonInteractive,
      output
    );
    this.clusterCommand = new ClusterCommand(this.output);
  }
}
