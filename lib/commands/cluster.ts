import jsLevenshtein from 'js-levenshtein';
import _ from 'lodash';
import {
  Transaction,
  txsExcludingIgnored,
  shortDescription,
} from '../transactions.js';
import { Command } from './index.js';

// the maximum levenshtein distance to qualify for cluster membership
const n = 5;

export class ClusterCommand implements Command {
  async execute(txs: Transaction[]): Promise<void> {
    txs = txsExcludingIgnored(txs);

    let clusters: Transaction[][] = [];
    txs.forEach((tx) => {
      const cluster = findBestCluster(clusters, tx);

      // if no match found - create new cluster
      if (!cluster) clusters.push([tx]);
      else cluster.push(tx);
    });

    console.log(`Found ${clusters.length} clusters.`);
    console.log();

    // clusters = _.orderBy(clusters, [(c) => c.length], ['desc']);
    clusters = _.orderBy(clusters, [computeTotal]);

    clusters.forEach((c) => {
      console.log('-'.repeat(80));
      const name = tidyDesc(c[0]);
      const categories = computeCategories(c);
      const total = computeTotal(c);
      const details = false;

      console.log(`Cluster: ${name}`);
      console.log(
        `Total: ${_.padStart(
          Math.ceil(total).toLocaleString(),
          5
        )} | Size: ${_.padStart(
          c.length.toString(),
          3
        )} | categories: ${categories}`
      );

      if (details) {
        console.log('-'.repeat(80));
        _.uniq(c.map(tidyDesc)).forEach((i) => console.log(i + '\n'));
      }
    });
  }
}

function findBestCluster(
  clusters: Transaction[][],
  tx: Transaction
): Transaction[] {
  let bestDistance = -1;
  let bestCluster: Transaction[];

  // find best cluster to put tx in
  clusters.forEach((cluster) => {
    // stricter membership rule for short txs
    const max = Math.max(Math.min(canon(tx).length - n, n), 0);
    const ls = levenshtein(cluster[0], tx);
    if (ls <= max && (bestDistance === -1 || ls < bestDistance)) {
      bestDistance = ls;
      bestCluster = cluster;
    }
  });

  return bestCluster;
}

function levenshtein(a: Transaction, b: Transaction): number {
  return jsLevenshtein(canon(a), canon(b)); // optimise - iff perf is bad
}

function canon(tx: Transaction): string {
  return tidyDesc(tx).replace(/\s/g, '').toLowerCase();
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

function tidyDesc(tx: Transaction): string {
  let desc = shortDescription(tx.description);
  noise.forEach((re) => (desc = desc.replace(re, '')));
  return desc.trim();
}

function computeTotal(cluster: Transaction[]): number {
  return cluster.reduce((total, tx) => total + tx.amount, 0);
}

function computeCategories(cluster: Transaction[]): string[] {
  return _.uniq(cluster.map((tx) => tx.category).sort());
}
