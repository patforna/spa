import { Dayjs } from '../date.js';
import { Card, Transaction } from '../transactions.js';
import { InputParser, parseCSV } from './index.js';

interface VisecaRow {
  cardId: string;
  date: Dayjs;
  amount: number;
  merchantName: string;
  merchantPlace: string;
  merchantCountry: string;
  stateType: string;
  details: string;
}

export class VisecaInputParser implements InputParser {
  async parse(input: string): Promise<Transaction[]> {
    const rows = parseCSV(input)
      .map((x) => x as VisecaRow)
      .filter((x) => x.stateType === 'BOOKED');

    const txs: Transaction[] = [];
    for (const row of rows) {
      txs.push({
        date: row.date,
        amount: -row.amount,
        description: [
          row.merchantName,
          row.merchantPlace,
          row.merchantCountry,
          row.details,
          '#viseca',
        ].join(' | '),
        card: parseVisecaCard(row.cardId),
      } as Transaction);
    }

    return txs;
  }
}

function parseVisecaCard(cardId: string | null): Card {
  if (!cardId) return Card.Unknown;
  if (cardId.endsWith('0002')) return Card.Self;
  if (cardId.endsWith('1250')) return Card.Partner;
  if (cardId.endsWith('4471')) return Card.Partner;
  return Card.Unknown;
}
