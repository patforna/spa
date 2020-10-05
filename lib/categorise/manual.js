const moment = require('moment');
const csv = require('../csv');

module.exports = [
  ['21.09.20', -140.8, 'shopping'],
  ['18.09.20', -37.03, 'shopping'],
  ['14.09.20', -55, 'shopping'], // toys
  ['13.09.20', -68.8, 'other'], // flight for jane's mum
  ['09.09.20', -75, 'shopping'], // toys
  ['31.08.20', -181.85, 'groceries'], // germany grocery shopping
  ['28.08.20', -40, 'other'], // swimming at swissotel
  ['25.08.20', -600, 'shopping'], // Nappies, wipes, toys, clothes, Nanit, coffee machine (gift for jane's mum)
  ['25.08.20', -46.31, 'shopping'], // cooking pot
  ['17.08.20', -197.1, 'groceries'], // oatly
  ['27.07.20', -52.91, 'shopping'], // grill pan
  ['27.07.20', -25, 'shopping'], // amazon order
  ['20.07.20', -145, 'other'], // birthlight
  ['20.07.20', -50.85, 'shopping'], // next directory
  ['20.07.20', -53.5, 'shopping'], // next directory
  ['15.07.20', -60.5, 'shopping'], // wok and frying pan
  ['12.07.20', -104, 'holidays'], // holidays / transport
  ['12.07.20', -245, 'eating_out'], // holidays / eating out
  ['09.07.20', -2.5, 'other'],
  ['09.07.20', -3.8, 'eating_out'],
  ['06.07.20', -5.9, 'groceries'],
  ['25.06.20', -61.9, 'shopping'], // deck chairs custom + vat
  ['19.06.20', -841.76, 'holidays'], // campervan
  ['08.06.20', -330, 'other'], // swimming lessons
  ['08.06.20', -50, 'shopping'], // swimming nappies
  ['04.06.20', -52.2, 'groceries'],
  ['25.05.20', -73.6, 'shopping'], // baby clotes & home stuff
  ['16.05.20', -39.0, 'other'], // baby weaning course
  ['12.05.20', -247.26, 'shopping'], // deck chairs
  ['12.05.20', -11.85, 'shopping'], // zebra leggins
  ['04.05.20', -49, 'shopping'], // gift for pediatrician
  ['27.04.20', -270, 'shopping'],
  ['27.04.20', -20, 'other'], // stamps
  ['22.04.20', -47.6, 'eating_out'],
  ['22.04.20', -47.5, 'eating_out'],
  ['20.04.20', -43, 'shopping'],
  ['24.03.20', -53.43, 'shopping'],
  ['16.03.20', -40, 'shopping'],
  ['03.03.20', -20, 'shopping'],
  ['17.02.20', -20.25, 'other'], // don't know
  ['11.02.20', -305, 'shopping'],
  ['10.02.20', -200, 'other'], // don't know
  ['27.01.20', -55.85, 'shopping'],
  ['20.01.20', -17.8, 'shopping'],
  ['19.01.20', -50, 'shopping'],
  ['15.01.20', -240, 'shopping'],
].map(([d, a, c]) => [moment.utc(d, csv.dateFormat), a, c]);
