# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Project Overview

A CLI that turns CSV exports from several banks (Viseca, ZKB, Wise, Revolut) into
a categorised view of household spending. Regex rules categorise the bulk;
per-transaction overrides pin the exceptions. Everything runs locally against
files on disk.

## Commands

Development goes through `just` — the same entry point CI uses.

```bash
just              # = just check
just check        # format-check, lint, typecheck, build, CLI smoke test, tests
just fix          # prettier --write, eslint --fix, sort data/rules.json
just build        # compile TypeScript to dist/
just test <args>  # run tests, optionally scoped
```

`bin/spa` runs from `dist/`, so run `just build` after changing anything under
`lib/`.

Run the CLI: `bin/spa <command> -i <inputs>` (`bin/spa --help` for the rest).

## Architecture

```
CSV files ──> InputParserFactory ──> Transaction[] ──> Categoriser ──> Command
                (sniffs header)                            │           (summary /
                                                           │            details /
                                        <data-dir>/rules.json            cluster)
                                        <data-dir>/overrides-<profile>.json
```

- `lib/main.ts` — yargs CLI, entry point
- `lib/wiring.ts` — dependency injection container; owns `DATA_DIR`
- `lib/parsers/*.ts` — one parser per bank format, chosen by sniffing the header
  line in `InputParserFactory`
- `lib/categoriser.ts` — overrides win (matched on date + amount), otherwise the
  regex rules apply
- `lib/rules.ts` — `RulesRepo` loads `<data-dir>/rules.json` and compiles each
  pattern to a case-insensitive `RegExp`
- `lib/transactions.ts` — `Transaction`/`Override` model, `OverridesRepo`,
  split expansion
- `lib/fxRates.ts` — Fixer.io conversion, cached on disk
- `lib/commands/*.ts` — `summary`, `details`, `cluster`, `categorise`,
  `import-overrides`
- `lib/tools/main.ts` — `bin/tools`, maintenance commands over the data files

**Data directory.** `SPA_DATA_DIR` decides where `rules.json`,
`overrides-<profile>.json` and `fxRates.json` are read and written; it defaults
to `./data`, the starter set that ships with the repo. Point it at a private
directory to keep real data out of the repo. `scripts/sort-rules.js` honours it
too.

**Card detection.** `parseVisecaCard()` maps the last four characters of the
Viseca card token to `Card.Self` / `Card.Partner`. Those suffixes are
installation-specific — change them, don't assume them.

## Conventions

- TypeScript strict mode, max 80 chars/line
- Dates are parsed as Europe/Zurich and stored as UTC (dayjs + its
  timezone/customParseFormat plugins, see `lib/date.ts`); month bucketing in
  `lib/summary.ts` converts back to Zurich
- Amounts: negative = debit, positive = credit
- Category `ignore` excludes a transaction from analysis
- Category `no_category` triggers the interactive prompt
- Rules never see anything but the description text — no amount, no date, no
  account. Anything needing context is an override.

## Categorisation Conventions

Judgement calls the rule engine cannot make, because rules match description
text only:

- Holiday spend is split by nature, not lumped into `travel` — restaurants →
  `eating_out`, supermarkets → `groceries`, attractions → `activities`
- `travel` is getting there and sleeping there: accommodation, flights, car
  rental, **plus fuel and road tolls/vignettes incurred on a trip**
- `car` is running the car at home: domestic fuel, servicing, repairs, fines
- Fuel and toll rules therefore default to `car`/`transport`; move trip ones to
  `travel` with overrides during the monthly run
- STWEG Nebenkosten count in full as `housing_nebenkosten`, renewal-fund
  contribution included — treat it as spent, don't split it out as a reserve

## Key Files for Common Tasks

| Task                  | Files                                      |
| --------------------- | ------------------------------------------ |
| Add a new bank format | `lib/parsers/*.ts`, `lib/parsers/index.ts` |
| Add a category        | `<data-dir>/rules.json`                    |
| Fix categorisation    | `lib/categoriser.ts`                       |
| Add a command         | `lib/commands/*.ts`, `lib/main.ts`         |
| Fix FX conversion     | `lib/fxRates.ts`                           |
