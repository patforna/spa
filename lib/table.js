const _ = require('lodash');
const table = require('table');
const yellow = require('chalk').yellow;
const sum = require('./summary').sum;

const config = {
  border: table.getBorderCharacters('norc'),
  columns: {
    1: { alignment: 'right' },
    2: { alignment: 'right' },
    3: { alignment: 'right' },
    4: { alignment: 'right' },
  },
};

module.exports = summary => {
  return table.table(tableData(summary), config);
};

const tableData = summary => {
  let rows = [];
  rows = _.concat(rows, [headerOrFooterRow(_.concat(summary.monthNames, ''))]);
  rows = _.concat(rows, categoryRows(summary));
  rows = _.concat(rows, [headerOrFooterRow(totalsRow(summary))]);

  return rows;
};

const headerOrFooterRow = values => {
  return _.concat('', values).map(x => yellow(x));
};

const categoryRows = summary => {
  return summary.categoryNames.map(c =>
    _.concat(
      yellow(c),
      format(summary.forCategoryByMonth(c)),
      yellow(format(summary.forCategory(c)))
    )
  );
};

const totalsRow = summary => {
  const items = summary.byMonth();
  return format(_.concat(items, sum(items)));
};

const format = item => {
  if (_.isArray(item)) return item.map(format);
  return `${item.total} (${item.transactions})`;
};
