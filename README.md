# spa

### Know where it hurts.

Local-first CLI that turns bank exports into an honest answer to where it all went.

```console
$ spa summary -i samples/*
Processing 5 files from input patterns: samples/*
…
┌─────────────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬───────────────┬─────┐
│                     │         Jan │         Feb │         Mar │         Apr │         May │         Jun │         Jul │         Aug │         Sep │         Oct │         Nov │         Dec │         Avg │         Total │   % │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ activities          │    -43  (2) │    -35  (1) │    -26  (1) │    -57  (2) │    -22  (1) │   -123  (4) │    -40  (2) │    -65  (2) │      0  (0) │    -69  (2) │    -79  (3) │      0  (0) │    -56  (2) │     -559 (20) │  1% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ allowance           │   -300  (1) │   -300  (1) │   -300  (1) │   -300  (1) │   -300  (1) │   -300  (1) │   -300  (1) │   -300  (1) │   -300  (1) │   -300  (1) │   -300  (1) │   -300  (1) │   -300  (1) │   -3,600 (12) │  5% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ car                 │    -72  (1) │   -395  (1) │    -93  (1) │      0  (0) │   -222  (2) │      0  (0) │    -97  (1) │   -610  (1) │    -82  (1) │      0  (0) │   -100  (1) │      0  (0) │   -209  (1) │   -1,671  (9) │  2% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ eating_out          │   -154  (4) │   -207  (5) │   -287  (6) │   -231  (7) │   -126  (5) │   -156  (6) │   -251  (9) │   -226  (7) │   -407  (8) │   -159  (6) │    -60  (3) │    -94  (4) │   -197  (6) │   -2,358 (70) │  3% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ groceries           │   -314  (8) │   -326  (8) │   -282  (6) │   -127  (4) │   -189  (5) │   -321  (6) │   -320  (6) │   -216  (4) │   -392  (7) │   -360  (7) │   -375  (7) │   -270  (7) │   -291  (6) │   -3,492 (75) │  5% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ health              │      0  (0) │   -350  (3) │   -169  (2) │    -58  (1) │      0  (0) │   -267  (3) │      0  (0) │    -67  (1) │    -89  (1) │      0  (0) │   -152  (2) │      0  (0) │   -165  (2) │   -1,152 (13) │  2% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ health_care         │   -846  (1) │   -846  (1) │   -846  (1) │   -846  (1) │   -846  (1) │   -846  (1) │   -846  (1) │   -846  (1) │   -846  (1) │   -846  (1) │   -846  (1) │   -846  (1) │   -846  (1) │  -10,152 (12) │ 14% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ housing_costs       │   -229  (2) │   -257  (2) │   -272  (2) │   -218  (2) │   -225  (2) │   -215  (2) │   -265  (2) │   -733  (4) │   -244  (2) │   -233  (2) │   -190  (2) │   -211  (2) │   -274  (2) │   -3,292 (26) │  5% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ housing_furnishing  │      0  (0) │   -289  (1) │      0  (0) │   -100  (1) │      0  (0) │   -412  (1) │      0  (0) │      0  (0) │   -613  (1) │      0  (0) │      0  (0) │      0  (0) │   -354  (1) │   -1,414  (4) │  2% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ housing_mortgage    │ -1,980  (1) │ -1,980  (1) │ -1,980  (1) │ -1,980  (1) │ -1,980  (1) │ -1,980  (1) │ -1,980  (1) │ -1,980  (1) │ -1,980  (1) │ -1,980  (1) │ -1,980  (1) │ -1,980  (1) │ -1,980  (1) │  -23,760 (12) │ 33% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ housing_nebenkosten │   -640  (1) │   -640  (1) │   -640  (1) │   -640  (1) │   -640  (1) │   -640  (1) │   -640  (1) │   -640  (1) │   -640  (1) │   -640  (1) │   -640  (1) │   -640  (1) │   -640  (1) │   -7,680 (12) │ 11% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ housing_upgrades    │      0  (0) │      0  (0) │      0  (0) │      0  (0) │      0  (0) │      0  (0) │      0  (0) │      0  (0) │      0  (0) │ -1,290  (1) │      0  (0) │      0  (0) │ -1,290  (1) │   -1,290  (1) │  2% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ insurance           │      0  (0) │   -318  (1) │      0  (0) │      0  (0) │   -318  (1) │      0  (0) │      0  (0) │   -318  (1) │      0  (0) │      0  (0) │   -318  (1) │      0  (0) │   -318  (1) │   -1,272  (4) │  2% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ no_category         │      0  (0) │      0  (0) │      0  (0) │      0  (0) │    -65  (1) │      0  (0) │      0  (0) │      0  (0) │    -24  (1) │      0  (0) │      0  (0) │      0  (0) │    -45  (1) │      -89  (2) │  0% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ services            │     -4  (1) │     -4  (1) │     -4  (1) │   -339  (2) │     -4  (1) │     -4  (1) │     -4  (1) │     -4  (1) │     -4  (1) │     -4  (1) │     -4  (1) │     -4  (1) │    -32  (1) │     -383 (13) │  1% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ shopping            │   -377  (2) │   -140  (3) │   -451  (3) │   -645  (5) │   -242  (4) │    -29  (3) │     -5  (3) │   -549  (3) │    -33  (1) │   -161  (2) │   -782  (3) │   -224  (4) │   -303  (3) │   -3,638 (36) │  5% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ subscriptions       │    -61  (4) │    -61  (4) │    -61  (4) │    -61  (4) │    -75  (5) │    -61  (4) │    -61  (4) │    -61  (4) │    -61  (4) │    -75  (5) │    -61  (4) │    -61  (4) │    -63  (4) │     -760 (50) │  1% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ transport           │    -78  (2) │    -50  (2) │    -82  (2) │    -39  (2) │   -127  (3) │   -141  (3) │    -30  (2) │    -67  (2) │    -62  (2) │   -160  (4) │    -75  (2) │    -97  (4) │    -84  (3) │   -1,008 (30) │  1% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│ travel              │      0  (0) │      0  (0) │   -290  (1) │      0  (0) │      0  (0) │   -541  (1) │ -2,130  (2) │      0  (0) │   -425  (1) │      0  (0) │      0  (0) │   -745  (2) │   -826  (1) │   -4,131  (7) │  6% │
├─────────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────────┼─────┤
│                     │ -5,098 (30) │ -6,198 (36) │ -5,783 (33) │ -5,641 (34) │ -5,381 (34) │ -6,036 (38) │ -6,969 (36) │ -6,682 (34) │ -6,202 (34) │ -6,277 (34) │ -5,962 (33) │ -5,472 (32) │ -5,975 (34) │ -71,701 (408) │     │
└─────────────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴───────────────┴─────┘
```

Built in 2020 to answer one question — _where does the money actually go?_ — and
run every month since. Four bank formats, no cloud, no account linking, no
subscription. CSVs in, a table out, everything on disk.

## Quick start

Node ≥ 22.9.

```bash
git clone https://github.com/patforna/spa && cd spa
npm install && npm run build
bin/spa summary -i samples/*
```

That works offline: the repo ships a starter rule set, a small FX cache and a
year of synthetic bank exports in the formats below. No API key needed.

## How it works

Two layers, in that order:

**Rules** — regex per category in `data/rules.json`. They do ~95% of the work and
match the description text only: no amount, no date, no account. That constraint
is deliberate — it keeps rules portable and forces anything context-dependent
into the layer below.

```jsonc
// data/rules.json (excerpt)
"groceries": ["aldi", "lidl", "^(?!.*coop\\s+restaurant).*coop(?!.*tankstelle)"],
"eating_out": ["(?<!hotel.*)restaurant(?!.*hotel)", "uber.+eats"],
"transport":  ["(?<!eats.*)uber(?!.*eats)", "sbb cff ffs"]
```

**Overrides** — an exception pinned to one transaction by `(date, amount)`, in
`data/overrides-<profile>.json`. They win over rules. Use them for the calls a
regex can't make: the trip fuel that belongs to `travel` rather than `car`, the
hardware-store run that was furniture rather than repairs.

```json
{
  "date": "2025-06-06T14:45:00.000Z",
  "amount": -412.35,
  "category": "housing_furnishing",
  "comment": "garden bench, not a building job"
}
```

A transaction that matches neither is `no_category`, and `spa` prompts for it —
autocomplete over your categories, an optional comment, and the answer is saved
as an override so you are never asked twice. Answer `split` to break one payment
across several categories.

Two more things worth knowing:

- **Hashtags.** Every category also matches its own name — put `#housing_upgrades`
  in a bank transfer's payment reference and it categorises itself.
- **`ignore`.** Internal transfers, card-bill debits and top-ups are excluded, so
  the total is spend rather than net cash flow.

## Commands

| Command                   | What it does                                                         |
| ------------------------- | -------------------------------------------------------------------- |
| `summary`                 | Category × month table for the year, with averages, totals and share |
| `details`                 | Every transaction, filterable by `-c <category>`, sortable           |
| `cluster`                 | Groups similar descriptions by edit distance — finds missing rules   |
| `import-overrides <file>` | Merges overrides from JSON, skipping duplicates                      |

Global flags: `--profile` picks the override set (household vs personal),
`--non-interactive` emits uncategorised transactions as JSON instead of
prompting, which is what makes the monthly run scriptable.

```console
$ spa details -c travel -s date -i samples/*
    CATEGORY |       DATE |     AMOUNT |     CARD | DESCRIPTION
      TRAVEL | 2025-03-17 |       -290 |  Unknown | Airbnb | city break | #wise
      TRAVEL | 2025-06-17 |       -541 |  Unknown | Airbnb | city break | #wise
      TRAVEL | 2025-07-04 |     -1,240 |     Self | Swiss Intl Air Lines | SWISS INT AIR LINES | #viseca
      TRAVEL | 2025-07-12 |       -890 |     Self | Hotel Bellavista | Ascona | HOTEL BELLAVISTA | #viseca
      TRAVEL | 2025-09-17 |       -425 |  Unknown | Airbnb | city break | #wise
      TRAVEL | 2025-12-17 |       -427 |  Unknown | Airbnb | city break | #wise
      TRAVEL | 2025-12-27 |       -318 |  Partner | Europcar | Zurich | EUROPCAR AUTOVERMIETUNG | #viseca
```

## Adapters

Formats are detected by sniffing the header line — no flags, no configuration.

| Bank        | Export           | Notes                                                |
| ----------- | ---------------- | ---------------------------------------------------- |
| **Viseca**  | Credit card CSV  | Skips unbooked rows; attributes spend per cardholder |
| **ZKB**     | Bank account CSV | Semicolon-delimited; handles multi-line detail rows  |
| **Wise**    | Statement CSV    | Multi-currency, converted to CHF                     |
| **Revolut** | Statement CSV    | Multi-currency; skips top-ups and pending rows       |
| —           | JSON             | Pre-parsed transactions, for piping between tools    |

Foreign-currency rows are converted via [Fixer.io](https://fixer.io) and cached
on disk, so a given date is fetched once and never again.

### Adding one

Implement the interface, register a sniff:

```ts
export interface InputParser {
  parse(input: string): Promise<Transaction[]>;
}
```

```ts
// lib/parsers/index.ts
if (firstLine.startsWith('Type,Product'))
  return new RevolutInputParser(this.fxRateService);
```

Then a unit test with three fixture rows — one ordinary, one refund, one your
bank does something strange with. `test/unit/parsers/` has four to copy from.

## Your own data

`SPA_DATA_DIR` decides where rules, overrides and the FX cache live. It defaults
to `./data` — the starter set — so point it somewhere private and the repo stays
clean:

```bash
cp .env.example .env      # then set SPA_DATA_DIR (and FIXER_API_KEY, if needed)
```

The starter rules are a beginning, not a taxonomy. Mine grew to ~500 patterns
over six years, mostly one merchant at a time during the monthly run; `cluster`
is what surfaces the next one worth adding.

## Scope

A personal tool, kept honest rather than general. Specifically: CHF-centric,
summaries are single-year, and it categorises spending — it is not a budget,
a forecast or a net-worth tracker. Some rough edges are known and left alone:
`cluster --n` is accepted but ignored, and running with no command at all
produces a stack trace rather than help.

## Development

```bash
just          # = just check
just check    # format, lint, types, build, CLI smoke test, 60 tests
just fix      # prettier --write, eslint --fix, sort the rules file
```

CI runs `just check`, the same entry point. Domain logic — categoriser, summary,
table, every parser — is covered at 90–100%; CLI wiring and the interactive
prompt are not.

## Licence

MIT
