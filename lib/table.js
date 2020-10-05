const _ = require('lodash');
const table = require('table');
const yellow = require('chalk').yellow;

const config = {
  border: table.getBorderCharacters('norc'),
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

module.exports = (summary) => {
  return table.table(tableData(summary), config);
};

const tableData = (summary) => {
  let rows = [];
  rows = _.concat(rows, [
    headerOrFooterRow(_.concat(summary.monthNames, 'Avg', 'Total')),
  ]);
  rows = _.concat(rows, categoryRows(summary));
  rows = _.concat(rows, [headerOrFooterRow(totalsRow(summary))]);

  return rows;
};

const headerOrFooterRow = (values) => {
  return _.concat('', values).map((x) => yellow(x));
};

const categoryRows = (summary) => {
  return summary.categoryNames.map((c) =>
    _.concat(
      yellow(c),
      format(summary.totalsForCategoryByMonth(c)),
      yellow(format(summary.avgForCategory(c))),
      yellow(format(summary.totalForCategory(c)))
    )
  );
};

const totalsRow = (summary) => {
  const items = summary.totalsByMonth();
  return format(_.concat(items, summary.avg(), summary.total()));
};

const format = (item) => {
  if (_.isArray(item)) return item.map(format);
  return `${_.round(item.amount)} (${_.round(item.transactions)})`;
};
