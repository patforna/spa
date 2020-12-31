import chalkPkg from 'chalk';
import lodashPkg from 'lodash';
import { getBorderCharacters, table as _table } from 'table';
const { yellow } = chalkPkg;
const { concat, isArray, round } = lodashPkg;

const config = {
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
  },
};

export default (summary) => {
  return _table(tableData(summary), config);
};

const tableData = (summary) => {
  let rows = [];
  rows = concat(rows, [
    headerOrFooterRow(concat(summary.monthNames, 'Avg', 'Total')),
  ]);
  rows = concat(rows, categoryRows(summary));
  rows = concat(rows, [headerOrFooterRow(totalsRow(summary))]);

  return rows;
};

const headerOrFooterRow = (values) => {
  return concat('', values).map((x) => yellow(x));
};

const categoryRows = (summary) => {
  return summary.categoryNames.map((c) =>
    concat(
      yellow(c),
      format(summary.totalsForCategoryByMonth(c)),
      yellow(format(summary.avgForCategory(c))),
      yellow(format(summary.totalForCategory(c)))
    )
  );
};

const totalsRow = (summary) => {
  const items = summary.totalsByMonth();
  return format(concat(items, summary.avg(), summary.total()));
};

const format = (item) => {
  if (isArray(item)) return item.map(format);
  return `${round(item.amount)} (${round(item.transactions)})`;
};
