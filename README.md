# Money

## The painful process

At the beginning of each month...

- Download common transactions to: `~/Drive/money/common/2025`

  - Download Viseca transactions (viseca-common-jane, viseca-common-patric)
  - Download ZKB transactions (zkb-common)
  - Download Wise transactions (wise-common)

- Download private transactions to: `~/Drive/money/patric/2025`

  - Download Viseca transactions (viseca-patric)
  - Download ZKB transactions (zkb-patric)
  - Download Revolut transactions (revolut-patric)

- Run common analysis for entire year:

  bin/money summary -i ~/Drive/money/common/2025

- Run private analysis for last month:

  bin/money summary -i ~/Drive/money/patric/2025-03\*

## Prerequisite

Node >= 20.6.0

For currency conversion (required for Wise transactions), you need:

1. A Fixer.io API key (get one at https://fixer.io)
2. Set it as an environment variable:

```bash
export FIXER_API_KEY=your_api_key_here
```

## Usage

For usage, type:

    bin/money --help

Or, to get help on a subcommand:

    bin/money summary --help

### Examples

    # Process a single file
    bin/money summary -i ~/Drive/money/common/2023/common-2023.csv

    # Process entire directories or multiple files
    bin/money summary -i ~/Drive/money/common/2025
    bin/money summary -i ~/Drive/money/common/2025/*.csv
    bin/money summary -i ~/Drive/money/common/2025/**/*

    # Show details for a category, sorted by amount
    bin/money details -c other -s amount -i ~/Drive/money/common/2023

    # Find similar transactions
    bin/money cluster -i ~/Drive/money/common/2023/common-2023.csv

## How to build

Install dependencies:

    npm install

To transpile the _.ts files to _.js, run:

    npm run build

Run tests:

    npm test

In watch mode:

    npm test -- --watch

Run linter:

    npm run lint

Run formatter:

    npm run format

## Debugging

    node --inspect-brk bin/money.mjs <other args>
