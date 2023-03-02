import { Categoriser } from './categoriser.js';
import { ItemRepo } from './items.js';

export const itemRepo = new ItemRepo(
  '/Users/you/code/spa/data/overrides.json' // FIXME
);
export const categoriser = new Categoriser(itemRepo.load());
