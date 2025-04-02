# Money

## Prerequisite

Node >= 20.6.0

## TODO
[ ] Only compute averages for months that actually have values
[ ] Re-write overrides without valuta and get rid of valuta code

## Usage

For usage, type:

    bin/money --help

Or, to get help on a subcommand:

    bin/money summary --help

### Examples

    # Process a single file
    bin/money summary -i ~/Drive/money/2023/common-2023.csv

    # Process entire directories or multiple files
    bin/money summary -i ~/Drive/money/2025
    bin/money summary -i ~/Drive/money/2025/*.csv
    bin/money summary -i ~/Drive/money/2025/**/*

    # Show details for a category, sorted by amount
    bin/money details -c other -s amount -i ~/Drive/money/2023

    # Find similar transactions
    bin/money cluster -i ~/Drive/money/2023/common-2023.csv

## How to build

Install dependencies:

    npm install

To transpile the *.ts files to *.js, run:

    tsc

Run tests:

    npm test

In watch mode:

    npm test -- --watch

Run linter:

    npm run lint

Run formatter:

    npm run format

