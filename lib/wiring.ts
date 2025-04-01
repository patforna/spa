import { FxRateRepo, FxRateService } from './tools/fxRates.js';
import { Categoriser } from './categoriser.js';
import { ItemRepo } from './items.js';
import { join } from 'path';

const projectRoot = process.cwd();
const overridesPath = join(projectRoot, 'data/overrides.json');
const additionalsPath = join(projectRoot, 'data/additionals.json');
const fxRatesPath = join(projectRoot, 'data/tools/fxRates.json');

export class Wiring {
  readonly overridesRepo: ItemRepo;
  readonly additionalsRepo: ItemRepo;
  readonly categoriser: Categoriser;
  readonly fxRateService: FxRateService;

  constructor() {
    this.overridesRepo = new ItemRepo(overridesPath);
    this.additionalsRepo = new ItemRepo(additionalsPath);
    this.fxRateService = new FxRateService(new FxRateRepo(fxRatesPath));
    this.categoriser = new Categoriser(this.overridesRepo.load());
  }
}
