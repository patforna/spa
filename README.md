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

    bin/money -f ~/Drive/money/2023/common-2023.csv summary

    bin/money -f ~/Drive/money/2023/common-2023.csv details -c other -s amount

    bin/money -f ~/Drive/money/2023/common-2023.csv cluster

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

