# TODOS

## Known issues

- `cluster --n` is documented and accepted but ignored — `lib/commands/cluster.ts`
  hardcodes the distance threshold
- Overrides match on `(date, amount)` alone. Two transactions on the same day for
  the same amount both pick up the first matching override — and a split
  override replaces both
- `percentageForCategory` divides by the grand total; an all-zero year yields
  `NaN`
- Fixer.io is called over plain HTTP with the key in the query string. The free
  tier only allows EUR as base, so cross rates are approximated via EUR
- `bin/tools regen` sets category and comment from freshly parsed transactions,
  but CSV parsers never populate those fields — it only makes sense against
  JSON input

## Refactors

- Tidy up description rendering (`shortDescription` in `lib/transactions.ts` is a
  pile of accumulated special cases)
- `lib/main.ts` parses argv twice, and `import-overrides` runs inside the yargs
  handler while every other command queues into `app.run` — two execution models
- `TxLoader.load` and `fxRates.ts` log via `console` directly, bypassing the
  `Output` port that exists for exactly this reason

## Features

- **Create a rule from the CLI.** When the categorise prompt hits an
  uncategorised transaction, allow `rule` alongside `split`: ask for the pattern
  and the category, write it to `rules.json`, update the in-memory rules and
  re-categorise. Same shape as split mode in `lib/commands/categorise.ts`.
- **Propose a category** for uncategorised transactions, based on the
  description and previously categorised spend.
