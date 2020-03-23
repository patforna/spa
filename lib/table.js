const _ = require('lodash');
const moment = require('moment');
const table = require('table');
const yellow = require('chalk').yellow;

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
  rows = _.concat(rows, [headerOrFooterRow(monthNames(summary))]);
  rows = _.concat(rows, categoryRows(summary));
  rows = _.concat(rows, [headerOrFooterRow(format(byMonth(summary)))]);

  return rows;
};

const monthNames = summary => {
  return _.take(moment.monthsShort(), summary.months.length);
};

const categoryNames = summary => {
  return _.union(summary.months.flatMap(m => Object.keys(m.categories))).sort();
};

const headerOrFooterRow = values => {
  return _.concat('', values, '').map(x => yellow(x));
};

const categoryRows = summary => {
  return categoryNames(summary).map(c =>
    _.concat(
      yellow(c),
      format(forCategoryByMonth(summary, c)),
      yellow(format(forCategory(summary, c)))
    )
  );
};

const byMonth = summary => {
  return summary.months.map(m => m.all);
};

const forCategoryByMonth = (summary, category) => {
  return summary.months.map((_, i) => itemOf(summary, i, category));
};

const forCategory = (summary, category) => {
  const items = forCategoryByMonth(summary, category);

  return {
    total: _.sum(items.map(x => x.total)),
    transactions: _.sum(items.map(x => x.transactions)),
  };
};

const itemOf = (summary, month, category) => {
  const deflt = { total: 0, transactions: 0 };
  return _.defaultTo(summary.months[month].categories[category], deflt);
};

const format = item => {
  if (_.isArray(item)) return item.map(format);
  return `${item.total} (${item.transactions})`;
};
