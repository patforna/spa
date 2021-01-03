import { yellow } from 'chalk';
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
  },
};

export function tableFrom(summary: Summary): string {
  return _table(tableData(summary), config);
}

function tableData(summary: Summary): any[] {
  let rows = [];
  rows = _.concat(rows, [
    headerOrFooterRow(_.concat(summary.monthNames, 'Avg', 'Total')),
  ]);
  rows = _.concat(rows, categoryRows(summary));
  rows = _.concat(rows, [headerOrFooterRow(totalsRow(summary))]);

  return rows;
}

function headerOrFooterRow(values: string[]): string[] {
  return _.concat('', values).map((x) => yellow(x));
}

function categoryRows(summary: Summary): string[][] {
  return summary.categoryNames.map((c) =>
    _.concat(
      yellow(c),
      formatTotals(summary.totalsForCategoryByMonth(c)),
      yellow(format(summary.avgForCategory(c))),
      yellow(format(summary.totalForCategory(c)))
    )
  );
}

function totalsRow(summary: Summary): string[] {
  const items = summary.totalsByMonth();
  return formatTotals(_.concat(items, summary.avg(), summary.total()));
}

function formatTotals(value: Total[]): string[] {
  return value.map(format);
}

function format(value: Total): string {
  return `${_.round(value.amount)} (${_.round(value.transactions)})`;
}
