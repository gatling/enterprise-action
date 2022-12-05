# Gatling Enterprise GitHub Action

This project provides integration between [Gatling Enterprise](https://gatling.io/enterprise/) and the [GitHub Actions](https://github.com/features/actions) CI/CD automation system.

It is currently under development. Documentation, contribution guidelines, etc. will be added when ready.  

## Development

Install dependencies:

```shell
yarn ci
```

Build the project:

```shell
yarn package
```

Run locally (input can be passed with environment variables, e.g. use `INPUT_FOO` for the input named `foo`):

```shell
yarn start
```

Run tests:

```shell
yarn test
```

Format code:

```shell
yarn format
```
