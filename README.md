# Money

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

    yarn

To transpile the *.ts files to *.js, run:

    tsc

Run tests:

    yarn test

Upgrade all dependencies:

    yarn upgrade-interactive --latest
    yarn upgrade

## Extras

### Prompt for ChatGPT to convert CSV (from wise card) to JSON

    I've got the following CSV data. It's got three fields per row (date, amount, description) and the first row is the header row.

    """
    date,amount,description
    2024-03-29T00:00:00.000Z,-34,West Harris Trust
    ...
    """

    I'd like you to:
    * convert the amount from GBP to CHF for the given date
    * map each row to the following json object (replace ${placeholders} with actual values from above):

    {
        "date": "${date}",
        "amount": ${amount},
        "description": "${description} | Partner #wise"
    }

    Please generate the entire data set in json.