import { createSummaryFromCSV } from '../lib/summary';

const csv = `Kontoauszug bis: 06.12.2020 ;;;
;;;
Kontonummer: 30 01 511.262-00;;;
Bezeichnung: Lohnkonto;;;
Saldo: CHF 6120.12;;;
;;;
Muster Hans & Muster Anna;;;
Seefeldstrasse 12;;;
8008 Zürich;;;
;;;
;;;
Datum;Buchungstext;Betrag;Valuta
04.12.20;E-Banking-Auftrag Muster Anna;-281.65;03.12.20
04.12.20;Zahlung - Coop-5178 ZH Seefeldst, Zürich - 02.12.2020 18:40 - Karten-Nr. xxxxxxxxxxxx6107;-1.25;02.12.20
03.12.20;Zahlung - Coop-2623 City SM, Zürich - 01.12.2020 15:29 - Karten-Nr. xxxxxxxxxxxx7837;-19.35;01.12.20
03.12.20;Zahlung - Migros ALN Kreuzplatz, Zürich - 01.12.2020 10:00 - Karten-Nr. xxxxxxxxxxxx7837;-8.05;01.12.20`;

test('should pass end to end', () => {
  const summary = createSummaryFromCSV(csv);
  const { amount, transactions } = summary.total();
  expect(amount).toBe(310);
  expect(transactions).toBe(4);
});
