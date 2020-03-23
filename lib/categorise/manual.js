const moment = require('moment');
const csv = require('../csv');

module.exports = [
  ['16.03.20', -40, 'shopping'], // check => clothes for bear?
  ['03.03.20', -20, 'shopping'],
  ['21.02.20', -2129, 'holidays'],
  ['17.02.20', -20.25, 'other'], // don't know
  ['11.02.20', -305, 'shopping'],
  ['10.02.20', -200, 'other'], // don't know
  ['27.01.20', -55.85, 'shopping'],
  ['20.01.20', -17.8, 'shopping'],
  ['19.01.20', -50, 'shopping'],
  ['15.01.20', -240, 'shopping'],
].map(([d, a, c]) => [moment.utc(d, csv.dateFormat), a, c]);
