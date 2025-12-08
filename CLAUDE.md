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
npm run check              # Run all: test, lint, format:check, typecheck (run before commits)
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
- `lib/categoriser.ts` - Rule-based + override categorization. Applies regex rules from `rules.ts`, falls back to user overrides (matched by date + amount)
- `lib/transactions.ts` - Transaction model (date, amount, description, category, comment, card) and OverridesRepo persistence
- `lib/rules.ts` - Hardcoded regex patterns for 33 categories (groceries, travel, insurance, etc.)
- `lib/wiring.ts` - Dependency injection container, initializes all repos/services
- `lib/fxRates.ts` - Currency conversion via Fixer.io API with caching
- `lib/parsers/*.ts` - CSV parsers for each bank format, auto-detected by InputParserFactory
- `lib/commands/*.ts` - Command implementations (summary, details, cluster, categorise)

**Card Detection:** Hardcoded card number patterns in `parseCard()` identify transactions by cardholder (Self/Partner/Unknown).

**Data Persistence:** JSON files in `data/` - `overrides.json` for user categorizations, `fxRates.json` for cached exchange rates.

## Conventions

- TypeScript strict mode, max 80 chars/line
- All dates use Zurich timezone via moment-timezone
- Amounts: negative = debit, positive = credit
- Category `ignore` excludes transactions from analysis
- Category `NO_CATEGORY` triggers user prompt
- FX rates fetched from Fixer.io (requires `FIXER_API_KEY` in `.env`)

## Key Files for Common Tasks

| Task                | Files                                      |
| ------------------- | ------------------------------------------ |
| Add new bank format | `lib/parsers/*.ts`, `lib/parsers/index.ts` |
| Add new category    | `lib/rules.ts`                             |
| Fix categorization  | `lib/categoriser.ts`                       |
| Add new command     | `lib/commands/*.ts`, `lib/main.ts`         |
| Fix FX conversion   | `lib/fxRates.ts`                           |
