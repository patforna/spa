import { Categoriser } from './categoriser';
import { ItemRepo } from './items';

export const itemRepo = new ItemRepo(
  '/Users/you/code/spa/data/overrides.json' // FIXME
);
export const categoriser = new Categoriser(itemRepo.load());
