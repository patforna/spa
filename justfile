set shell := ["bash", "-cu"]
set dotenv-load := true

# runs just check
default:
    just check

# compile TypeScript to dist/
build:
    npm run build

# format, auto-fix lint and sort the rules file in place
fix:
    npm run format
    npx eslint . --fix
    npm run sort-rules

# verify formatting without rewriting files
format-check:
    npm run format:check

# lint with eslint
lint:
    npm run lint

# type-check without emitting
typecheck:
    npm run typecheck

# run tests - pass a path or -t to scope
test *args:
    npm test -- {{args}}

# smoke-test the CLI against the sample data that ships with the repo
cli-check:
    ./bin/spa --help > /dev/null
    SPA_DATA_DIR=data ./bin/spa summary --non-interactive -i samples/ > /dev/null

# everything CI runs: formatting, lint, types, build, smoke test, tests
check *args:
    just format-check
    just lint
    just typecheck
    just build
    just cli-check
    just test {{args}}
