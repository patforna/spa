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

    bin/money -f ~/Drive/money/common-2023.csv summary

    bin/money -f ~/Drive/money/common-2023.csv details -c other -s amount

    bin/money -f ~/Drive/money/common-2023.csv cluster

### Adding extra items manually

Edit `additionals.json`.

## How to build

Install dependencies:

    npm install

To transpile the *.ts files to *.js, run:

    tsc

Run tests:

    npm test

Run linter:

    npm lint

Run formatter:

    npm format

Upgrade all dependencies:

    npm upgrade-interactive --latest
    npm upgrade
