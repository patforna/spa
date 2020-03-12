const moment = require('moment');
const csv = require('../csv');

module.exports = [
  // TODO ['03.03.20', -20, '?'],
  ['21.02.20', -2129, 'holidays'],
  // TODO ['17.02.20', -20.25, '?'],
  ['11.02.20', -305, 'shopping'],
  // TODO ['10.02.20', -200, '?'],
  ['27.01.20', -55.85, 'shopping'],
  ['20.01.20', -17.8, 'shopping'],
  ['19.01.20', -50, 'shopping'],
  ['15.01.20', -240, 'shopping'],
].map(([d, a, c]) => [moment(d, csv.dateFormat), a, c]);
