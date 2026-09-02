# 🫧 spa - know where it hurts.

Local-first CLI that turns bank exports into an honest answer to where it all went.

[![CI](https://github.com/patforna/spa/actions/workflows/ci.yml/badge.svg)](https://github.com/patforna/spa/actions/workflows/ci.yml)

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

I wrote this in 2020 because I genuinely had no idea where our money was going,
and I've run it every month since. It reads CSV exports from four banks and
prints the table above. Nothing leaves the machine. Since the end of 2025, I'm
primarily using the CLI via Claude Code.

## Quick start

Node ≥ 22.9.

```bash
git clone https://github.com/patforna/spa && cd spa
npm install && npm run build
cp -r examples data          # starter rules, a few overrides, cached FX rates
bin/spa summary -i samples/*
```

No API key needed. `examples/` is read-only reference; `data/` is where the tool
actually reads and writes, and it's git-ignored so your spending can't end up in
a commit by accident. The samples are a year of made-up bank exports in the four
formats below.

## How it works

Two layers, and they don't work the same way.

**Rules are yours.** Regexes grouped by category in `rules.json`, hand-edited and
committed. This is the file that accumulates, and it's what makes the tool worth
anything by year two.

```jsonc
// rules.json (excerpt)
"groceries":  ["migros", "carrefour"],
"eating_out": ["mame cafe", "pizza", "uber.+eats"],
"travel":     ["airbnb", "booking\\.com", "easyjet"],
"transport":  ["uber(?!.+eats)", "trainline"]
```

**Overrides are the tool's.** When nothing matches, `spa` asks you, once:

```console
? Enter category for the following transaction (or enter "split"):
 2025-09-08 |        -24 |  Partner | Caravan | London | CARAVAN KINGS CROSS | #viseca
 e
❯ eating_out
```

Your answer is written to `overrides-<profile>.json`, keyed on `(date, amount)`,
and it beats any rule. You almost never open this file yourself:

```json
{
  "date": "2025-09-08T17:40:00.000Z",
  "amount": -24,
  "category": "eating_out"
}
```

So the question at the prompt is really: am I going to see this merchant again?
If yes, it's worth a rule. If it's a one-off, or the right answer depends on
something the description can't tell you (the petrol was bought on holiday, so
it's `travel` rather than `car`), just answer and let it become an override.

Type `split` instead of a category to divide one payment across several.

Two smaller things:

- **Hashtags.** Every category matches its own name, so putting
  `#housing_upgrades` in a bank transfer's payment reference categorises it for
  you. Handy for the transfers you make yourself.
- **`ignore`.** Internal transfers, card bills and top-ups are dropped, otherwise
  the totals measure cash sloshing about rather than money actually spent.

## Writing rules

One array of regex patterns per category:

```json
{
  "eating_out": ["caravan", "\\bcaf[eé]\\b"],
  "transport": ["uber(?!.+eats)", "lime ltd"]
}
```

Each string becomes a case-insensitive JavaScript regex, tested against the
whole description. That description is everything the parser could find, joined
with `|`, ending in a tag naming the source:

```
Denner | Zurich | CHE | Denner | #viseca
Debit Account transfer: Hornbach Baumarkt | badezimmer umbau | #zkb
```

Two useful consequences. You can pin a rule to one bank (`wagamama.*#revolut`),
and for bank transfers you can match on the payment reference, which you control,
rather than on a merchant name you don't. The terminal shows a tidied version of
this string, but rules see the raw one.

Adding a category is adding a key. Nothing else needs to change.

The one hard constraint: **two categories must never match the same
transaction**. `spa` raises an error rather than picking one.

`just fix` sorts the file so diffs stay readable. `cluster` is how you find the
next pattern worth adding: it groups descriptions by edit distance, so a merchant
you've paid eleven times shows up once.

## Commands

| Command   | What it does                                                         |
| --------- | -------------------------------------------------------------------- |
| `summary` | Category × month table for the year, with averages, totals and share |
| `details` | Every transaction, filterable by `-c <category>`, sortable           |
| `cluster` | Groups similar descriptions by edit distance — finds missing rules   |

`--profile` chooses which override file to use, which is how I keep household
and personal spend apart. `--non-interactive` prints uncategorised transactions
as JSON rather than prompting, which is what makes the monthly run scriptable.

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

The format is worked out from the header line, so you never have to say which
bank a file came from.

| Bank        | Export           | Notes                                                |
| ----------- | ---------------- | ---------------------------------------------------- |
| **Viseca**  | Credit card CSV  | Skips unbooked rows; attributes spend per cardholder |
| **ZKB**     | Bank account CSV | Semicolon-delimited; handles multi-line detail rows  |
| **Wise**    | Statement CSV    | Multi-currency, converted to CHF                     |
| **Revolut** | Statement CSV    | Multi-currency; skips top-ups and pending rows       |
| —           | JSON             | Pre-parsed transactions, for piping between tools    |

Foreign currency goes through [Fixer.io](https://fixer.io). Rates are cached on
disk, so each date is only ever fetched once.

### Adding one

Write a parser and add one line to the factory:

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

Then a unit test with a handful of rows pasted from a real export. Include a
refund, and whatever odd thing your bank does that you'll otherwise forget about.
There are four parsers in `test/unit/parsers/` to crib from.

## Your own data

`data/` is git-ignored, so the default already keeps your spending out of
commits. If you'd rather version it separately, or keep it nowhere near the repo,
point `SPA_DATA_DIR` at another directory:

```bash
cp .env.example .env      # then set SPA_DATA_DIR (and FIXER_API_KEY, if needed)
```

Mine lives in a second, private repo, so the rules and overrides get the same
history as the code without any of it being public.

Don't expect the starter rules to fit you. Mine are up to about 500 patterns
after six years, added a merchant at a time whenever the monthly run turned one
up. `cluster` is what tells me which one to add next.

## Scope

This is a personal tool and it shows. Amounts are CHF, summaries cover one year
at a time, and all it does is categorise spending. No budgets, no forecasts, no
net worth. One rough edge I've never got round to: `cluster --n` is accepted and
then quietly ignored. `TODOS.md` has the rest.

## Development

```bash
just          # = just check
just check    # format, lint, types, build, CLI smoke test, 60 tests
just fix      # prettier --write, eslint --fix, sort the rules file
```

CI runs `just check` as well, so there's one thing to remember. Coverage is
90-100% on the parts that do the thinking (categoriser, summary, table, the
parsers) and thin on the CLI wiring and the interactive prompt.

## Licence

MIT
