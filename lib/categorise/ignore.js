const moment = require('moment');
const csv = require('../csv');

module.exports = [
  ['04.03.20', -20],
  ['25.02.20', -50],
  ['11.02.20', -365.25],
  ['29.01.20', -135.45],
  ['27.01.20', -80],
  ['14.01.20', -89],
].map(([d, a, c]) => [moment.utc(d, csv.dateFormat), a, c]);
