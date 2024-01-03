import { Categoriser } from './categoriser.js';
import { ItemRepo } from './items.js';

export const overridesRepo = new ItemRepo(
  '/Users/you/code/spa/data/overrides.json' // FIXME
);
export const additionalsRepo = new ItemRepo(
  '/Users/you/code/spa/data/additionals.json' // FIXME
);
export const categoriser = new Categoriser(overridesRepo.load());
