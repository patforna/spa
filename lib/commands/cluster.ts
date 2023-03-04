import jsLevenshtein from 'js-levenshtein';
import _ from 'lodash';
import { IGNORE } from '../categoriser.js';
import { Item, shortDescription } from '../items.js';
import { Command } from './index.js';

// the maximum levenshtein distance to qualify for cluster membership
const n = 5;

export class ClusterCommand implements Command {
  async execute(items: Item[]): Promise<void> {
    items = items.filter((item) => item.category !== IGNORE);

    let clusters: Item[][] = [];
    items.forEach((item) => {
      const cluster = findBestCluster(clusters, item);

      // if no match found - create new cluster
      if (!cluster) clusters.push([item]);
      else cluster.push(item);
    });

    console.log(`Found ${clusters.length} clusters.`);
    console.log();

    // clusters = _.orderBy(clusters, [(c) => c.length], ['desc']);
    clusters = _.orderBy(clusters, [computeTotal]);

    clusters.forEach((c) => {
      console.log(_.repeat('-', 80));
      const name = tidyDesc(c[0]);
      const categories = computeCategories(c);
      const total = computeTotal(c);
      const details = false;

      console.log(`Cluster: ${name}`);
      console.log(
        `Total: ${_.padStart(
          _.ceil(total, 0).toLocaleString(),
          5
        )} | Size: ${_.padStart(
          c.length.toString(),
          3
        )} | categories: ${categories}`
      );

      if (details) {
        console.log(_.repeat('-', 80));
        _.uniq(c.map(tidyDesc)).forEach((i) => console.log(i + '\n'));
      }
    });
  }
}

function findBestCluster(clusters: Item[][], item: Item): Item[] {
  let bestDistance = -1;
  let bestCluster: Item[];

  // find best cluster to put item in
  clusters.forEach((cluster) => {
    // stricter membership rule for short items
    let max = Math.max(Math.min(canon(item).length - n, n), 0);
    let ls = levenshtein(cluster[0], item);
    if (ls <= max && (bestDistance === -1 || ls < bestDistance)) {
      bestDistance = ls;
      bestCluster = cluster;
    }
  });

  return bestCluster;
}

function levenshtein(a: Item, b: Item): number {
  return jsLevenshtein(canon(a), canon(b)); // TODO optimise - iff perf is bad
}

function canon(item: Item): string {
  return tidyDesc(item).replace(/\s/g, '').toLowerCase();
}

const noise = [
  /belastung/gi,
  /bellevue/gi,
  /zürich/gi,
  /zu.?rich/gi,
  /seefe[\w]*/gi,
  /stadelhofen/gi,
  /kreuzstrasse/gi,
  /kreuzplatz/gi,
  /hottinge[\w]*/gi,
  /sumup/gi,
  /tenero/gi,
  /düdingen/gi,
  /sihlpassage/gi,
  /brunaupark/gi,
  /zh/gi,
  /[^a-z\säöü]/gi,
];

function tidyDesc(item: Item): string {
  let desc = shortDescription(item);
  noise.forEach((re) => (desc = desc.replace(re, '')));
  return desc.trim();
}

function computeTotal(cluster: Item[]): number {
  return _.reduce(cluster, (total, item) => (total += item.amount), 0);
}

function computeCategories(cluster: Item[]): String[] {
  return _.uniq(cluster.map((i) => i.category).sort());
}
