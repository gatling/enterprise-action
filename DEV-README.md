# Working on the Gatling Enterprise GitHub Action

## Development

Install dependencies:

```shell
yarn ci
```

Build the project:

```shell
yarn package
```

Run tests:

```shell
yarn test
```

Format code:

```shell
yarn format
```

## Run gh-action locally

Run locally (input can be passed with environment variables, e.g. use `INPUT_FOO` for the input named `foo`):

```shell
yarn gh-action-start
```

### Run locally with `act`

`act` allows to run workflows locally in an environment similar to a real GitHub Actions environment. See [the act README](https://github.com/nektos/act) for installation instructions.

For instance, we can use `act` to test the [run-enterprise-action.yml](.github/workflows/run-enterprise-action.yml) workflow:
- Create a JSON file for the workflow's input parameters [as explained here](https://github.com/nektos/act#pass-inputs-to-manually-triggered-workflows), e.g. called `payload.json`
- Create a secrets file [as explained here](https://github.com/nektos/act#secrets), e.g. called `secrets`, to define the `TEST_CLOUD_PROD_GATLING_CORP_START_API_TOKEN` secret containing your test API token
- Run the workflow with `act workflow_dispatch --eventpath payload.json --secret-file secrets`.

See the `act` README for other ideas on how to test workflows locally.
