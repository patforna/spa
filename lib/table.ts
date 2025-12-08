import chalk from 'chalk';
import _ from 'lodash';
import { getBorderCharacters, table as _table, TableUserConfig } from 'table';
import { Summary, Total } from './summary.js';

const config: TableUserConfig = {
  border: getBorderCharacters('norc'),
  columns: {
    1: { alignment: 'right' },
    2: { alignment: 'right' },
    3: { alignment: 'right' },
    4: { alignment: 'right' },
    5: { alignment: 'right' },
    6: { alignment: 'right' },
    7: { alignment: 'right' },
    8: { alignment: 'right' },
    9: { alignment: 'right' },
    10: { alignment: 'right' },
    11: { alignment: 'right' },
    12: { alignment: 'right' },
    13: { alignment: 'right' },
    14: { alignment: 'right' },
    15: { alignment: 'right' },
  },
};

export function tableFrom(summary: Summary, sortBy: string): string {
  return _table(tableData(summary, sortBy), config);
}

export function tableData(summary: Summary, sortBy: string): string[][] {
  let rows = [];
  rows = _.concat(rows, [
    headerOrFooterRow(_.concat(summary.monthNames, 'Avg', 'Total', '%')),
  ]);
  rows = _.concat(rows, categoryRows(summary, sortBy));
  rows = _.concat(rows, [headerOrFooterRow(totalsRow(summary))]);

  return rows;
}

function headerOrFooterRow(values: string[]): string[] {
  return _.concat('', values).map((x) => chalk.yellow(x));
}

function categoryRows(summary: Summary, sortBy: string): string[][] {
  let categories = summary.categoryNames;

  if (sortBy === 'amount')
    categories = _.sortBy(
      categories,
      (c) => -summary.totalForCategory(c).amount
    );

  return categories.map((c) =>
    _.concat(
      chalk.yellow(c),
      formatTotals(summary.totalsForCategoryByMonth(c)),
      chalk.yellow(format(summary.avgForCategory(c))),
      chalk.yellow(format(summary.totalForCategory(c))),
      chalk.yellow(summary.percentageForCategory(c) + '%')
    )
  );
}

function totalsRow(summary: Summary): string[] {
  const totals = summary.totalsByMonth();
  return _.concat(
    formatTotals(_.concat(totals, summary.avg(), summary.total())),
    ''
  );
}

function formatTotals(totals: Total[]): string[] {
  return totals.map(format);
}

function format(total: Total): string {
  const parts = [];
  parts.push(
    (
      Math.sign(total.amount) * Math.round(Math.abs(total.amount))
    ).toLocaleString()
  );
  parts.push(
    _.padStart('(' + _.round(total.transactions).toLocaleString() + ')', 4)
  );
  return parts.join(' ');
}
