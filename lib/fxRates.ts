import axios from 'axios';
import currency from 'currency.js';
import { readFileSync, writeFileSync } from 'fs';
import stringify from 'json-stringify-pretty-compact';
import _ from 'lodash';
import dayjs, { Dayjs } from './date.js';

const API_KEY = process.env['FIXER_API_KEY'];
const API_URL = 'http://data.fixer.io/api/';
const RATE_LIMIT_DELAY_MS = 1000; // 1 second delay between API calls to avoid rate limiting errors

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
    date = dayjs.utc()
  ): Promise<number> {
    const rate = await this.getRate(from, to, date);
    return currency(amount).multiply(rate).value;
  }

  async getRate(from: string, to: string, date = dayjs.utc()): Promise<number> {
    const truncatedDate = date.utc().startOf('day');
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
    date: Dayjs
  ): Promise<number> {
    try {
      // Rate limiting: wait 1 second between API calls to avoid rate limiting errors
      console.log(
        `Rate limiting: waiting ${RATE_LIMIT_DELAY_MS}ms before API call`
      );
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));

      const response = await axios.get(this.endpointUrl(from, to, date));

      // Check if the API call was successful
      if (!response.data || response.data.success === false) {
        throw new Error(`API request failed: ${JSON.stringify(response.data)}`);
      }

      // Check if the required currencies are in the response
      const rates = response.data.rates;
      if (!rates || !rates[from] || !rates[to]) {
        throw new Error(
          `Currency ${from} or ${to} not found in API response: ${JSON.stringify(response.data)}`
        );
      }

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

  private endpointUrl(from: string, to: string, date: Dayjs): string {
    const d = date.format('YYYY-MM-DD');
    return `${API_URL}${d}?access_key=${API_KEY}&base=EUR&symbols=${from},${to}`;
  }

  private cacheKey(date: Dayjs, pair: string): string {
    return `${date.toISOString()}_${pair}`;
  }

  private createCacheFrom(items: FxRateItem[]): Map<string, FxRateItem> {
    const cache = new Map<string, FxRateItem>();
    items.forEach((it) => cache.set(this.cacheKey(it.date, it.pair), it));
    return cache;
  }
}

export interface FxRateItem {
  date: Dayjs;
  pair: string;
  rate: number;
}

function createFxRatePair(from: string, to: string): string {
  return `${from}_${to}`.toUpperCase();
}

function createFxRateItem(date: Dayjs, pair: string, rate: number): FxRateItem {
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
      createFxRateItem(dayjs.utc(x.date), x.pair, Number(x.rate))
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
