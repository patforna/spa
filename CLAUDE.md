# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A CLI-based personal finance tool that processes CSV exports from multiple banking platforms (Viseca, ZKB, Wise, Revolut) to categorize and analyze transactions. Users manually categorize uncategorized transactions via interactive prompts, with support for transaction splitting and currency conversion.

## Commands

```bash
npm run build              # Compile TypeScript to dist/
npm run typecheck          # Type-check only (no emit)
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
npm test                   # Run Jest tests
npm test -- --watch        # Watch mode for single test iteration
npm run check              # Run all: test, lint, format, typecheck, sort-rules (run before commits)
                           # Note: writes — prettier reformats and rules.json gets sorted,
                           # so stage the resulting changes too
```

Run the CLI: `bin/money <command> -i <input-files>`

## Architecture

**Data Flow:**

```
CSV Files → InputParserFactory → Transactions → Categoriser → Commands (summary/details/cluster)
                                                    ↓
                                          data/overrides.json (user categorizations)
```

**Key Components:**

- `lib/main.ts` - CLI setup with yargs, entry point
- `lib/categoriser.ts` - Override + rule-based categorization. Overrides win (matched by date + amount); otherwise regex rules apply
- `lib/transactions.ts` - Transaction model (date, amount, description, category, comment, card) and OverridesRepo persistence
- `lib/rules.ts` - Loads `data/rules.json`, which holds the regex patterns for 20 categories (groceries, travel, insurance, etc.)
- `lib/wiring.ts` - Dependency injection container, initializes all repos/services
- `lib/fxRates.ts` - Currency conversion via Fixer.io API with caching
- `lib/parsers/*.ts` - CSV parsers for each bank format, auto-detected by InputParserFactory
- `lib/commands/*.ts` - Command implementations (summary, details, cluster, categorise)

**Card Detection:** Hardcoded card number patterns in `parseCard()` identify transactions by cardholder (Self/Partner/Unknown).

**Data Persistence:** JSON files in `data/` - `overrides-{profile}.json` for user categorizations, `rules.json` for the category patterns, `fxRates.json` for cached exchange rates.

## Conventions

- TypeScript strict mode, max 80 chars/line
- All dates use Zurich timezone via moment-timezone
- Amounts: negative = debit, positive = credit
- Category `ignore` excludes transactions from analysis
- Category `NO_CATEGORY` triggers user prompt
- FX rates fetched from Fixer.io (requires `FIXER_API_KEY` in `.env`)

## Categorisation Conventions

Judgement calls the rule engine can't make — rules match description text only, so they know nothing about context. Apply these when categorising:

- Holiday spend is split by nature, not lumped into `travel` — restaurants → `eating_out`, supermarkets → `groceries`, attractions → `activities`
- `travel` is getting there and sleeping there: accommodation, flights, car rental, **plus fuel and road tolls/vignettes incurred on a trip**
- `car` is running the car at home: domestic fuel, servicing, repairs, fines
- Fuel and toll rules therefore default to `car`/`transport`; move trip ones to `travel` with overrides during the monthly run
- STWEG Nebenkosten count in full as `housing_nebenkosten`, Erneuerungsfonds contribution included — treat it as spent, don't split it out as a reserve

## Key Files for Common Tasks

| Task                | Files                                      |
| ------------------- | ------------------------------------------ |
| Add new bank format | `lib/parsers/*.ts`, `lib/parsers/index.ts` |
| Add new category    | `data/rules.json`                          |
| Fix categorization  | `lib/categoriser.ts`                       |
| Add new command     | `lib/commands/*.ts`, `lib/main.ts`         |
| Fix FX conversion   | `lib/fxRates.ts`                           |
