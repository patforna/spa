import axios from 'axios';
import currency from 'currency.js';
import { readFileSync, writeFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import _ from 'lodash';
import moment from 'moment';

const API_KEY = process.env['FIXER_API_KEY'];
const API_URL = 'http://data.fixer.io/api/';

export class FxRateService {
  #repo: FxRateRepo;
  #cache: Map<string, FxRateItem>;
  constructor(repo: FxRateRepo) {
    this.#repo = repo;
    this.#cache = this.createCacheFrom(repo.load());
  }

  async convert(
    from: string,
    to: string,
    amount: number,
    date = moment.utc()
  ): Promise<number> {
    const rate = await this.getRate(from, to, date);
    return currency(amount).multiply(rate).value;
  }

  async getRate(
    from: string,
    to: string,
    date = moment.utc()
  ): Promise<number> {
    const truncatedDate = date.clone().utc().startOf('day');
    const pair = createFxRatePair(from, to);
    const item = this.#cache.get(this.cacheKey(truncatedDate, pair));

    if (item) return item.rate;

    const rate = await this.fetchRate(from, to, date);
    this.#repo.save(createFxRateItem(truncatedDate, pair, rate));
    this.#cache = this.createCacheFrom(this.#repo.load());

    return rate;
  }

  private async fetchRate(
    from: string,
    to: string,
    date: moment.Moment
  ): Promise<number> {
    try {
      const response = await axios.get(this.endpointUrl(from, to, date));
      // this is a hack/workaround because the free version of fixer.io only
      // allows EUR as a base currency. Therefore we request the EUR exchange
      // for both `to` and `from` and approximate the exchange rate for the
      // pair that way ¯\_(ツ)_/¯.
      const fxRate = currency(response.data.rates[to]).divide(
        currency(response.data.rates[from])
      );
      return fxRate.value;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      throw error;
    }
  }

  private endpointUrl(from: string, to: string, date: moment.Moment): string {
    const d = date.format('YYYY-MM-DD');
    return `${API_URL}${d}?access_key=${API_KEY}&base=EUR&symbols=${from},${to}`;
  }

  private cacheKey(date: moment.Moment, pair: string): string {
    return `${date.toISOString()}_${pair}`;
  }

  private createCacheFrom(items: FxRateItem[]): Map<string, FxRateItem> {
    const cache = new Map<string, FxRateItem>();
    items.forEach((it) => cache.set(this.cacheKey(it.date, it.pair), it));
    return cache;
  }
}

export interface FxRateItem {
  date: moment.Moment;
  pair: string;
  rate: number;
}

function createFxRatePair(from: string, to: string): string {
  return `${from}_${to}`.toUpperCase();
}

function createFxRateItem(
  date: moment.Moment,
  pair: string,
  rate: number
): FxRateItem {
  return {
    date,
    pair,
    rate,
  };
}

export class FxRateRepo {
  #path: string;
  #items: FxRateItem[];
  constructor(path: string) {
    this.#path = path;
  }

  load(): FxRateItem[] {
    const loaded = JSON.parse(readFileSync(this.#path).toString());
    this.#items = loaded.map((x) =>
      createFxRateItem(moment.utc(x.date), x.pair, Number(x.rate))
    );
    return this.#items;
  }

  save(item: FxRateItem): void {
    this.#items.push(item);
    this.saveAll(this.#items);
  }

  saveAll(items: FxRateItem[]): void {
    const toSave = _.sortBy(items, ['date']);
    writeFileSync(this.#path, stringify(toSave));
    this.load();
  }
}
