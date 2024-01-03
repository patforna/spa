# Money

## Usage

For usage, type:

    bin/money --help

Or, to get help on a subcommand:

    bin/money summary --help

### Examples

    bin/money -f ~/Drive/money/common-2023.csv summary

    bin/money -f ~/Drive/money/common-2023.csv details -c other -s amount

    bin/money -f ~/Drive/money/common-2023.csv cluster

## How to build

Install dependencies:

    yarn

To transpile the *.ts files to *.js, run:

    tsc

Run tests:

    yarn test

Upgrade all dependencies:

    yarn upgrade-interactive --latest
    yarn upgrade
