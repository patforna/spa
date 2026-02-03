# Money

## Prerequisite

Node >= 20.6.0

For currency conversion (required for Wise transactions), you need:

- A Fixer.io API key (get one at https://fixer.io) - see .env.example.

## Usage

For usage, type:

    bin/money --help

Or, to get help on a subcommand:

    bin/money summary --help

### Examples

    # Process a single file
    bin/money summary -i ~/Drive/finance/transactions/common/2025-10-viseca-common-patric.csv

    # Process multiple files with glob pattern
    bin/money summary -i ~/Drive/finance/transactions/common/2025*

    # Use a different profile (uses data/overrides-patric.json)
    bin/money summary --profile patric -i ~/Drive/finance/transactions/patric/2025-12*

    # Non-interactive mode: output uncategorised as JSON instead of prompting
    bin/money summary --non-interactive -i ~/Drive/finance/transactions/common/2025-12*

    # Show details for a category, sorted by amount
    bin/money details -c other -s amount -i ~/Drive/finance/transactions/common/2025-10*

    # Find similar transactions (useful for identifying new rules)
    bin/money cluster -i ~/Drive/finance/transactions/common/2025*

    # Import overrides from a JSON file (for automation)
    bin/money import-overrides --profile patric /tmp/overrides.json

### Monthly Workflow

For the full monthly transaction processing workflow (used with Claude Code), see:

    ~/.claude/skills/monthly-spending/SKILL.md

## Development

Install dependencies:

    npm install

Build (after every \*.ts change):

    npm run build

Run before committing 🚨 (test, lint, typecheck, format, sort-rules):

    npm run check

Run tests directly:

    npm test
    npm test -- --watch # watch mode
