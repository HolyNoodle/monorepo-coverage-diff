# Monorepository coverage diff

## Introduction

This projects aims to provide a way to ease CI test coverage difference based on a `coverage-summary.json` file.

The process of the code is as follow:
- pull base branch (default main)
- run commands to initialize current branch and base branch coverage files (here we should run things like dependency installation, building, testing and outputing the `coverage-summary.json` file)
- run coverage diff between current branch and base branch project by project
- post a comment to the PR that sumarize which project has seen it's coverage changed with collapsible details

## Configuration

Example of a github workflow configuration:
```yml
name: Pull request

on:
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          cache: "yarn" # using yarn in this example, but it's just a matter of choice

      # The important part is below
      - uses: holynoodle/monorepo-coverage-diff@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }} #required to pull the base branch and post the comment in the PR
          base: main # default to main if not provided
          projects: | # List of projects and path to each project, coverage file for this project will be searched at the project root
            project1:path/to/project1
            project2:path/to/project2
            project3:path/to/project3
          commands: | # List of command to run to initialize and generate the coverage file for all the projects above.
            yarn --frozen-lockfile
            yarn build
            yarn ci:unit
```

## PR comment

TODO: Add an exhaustive example of the PR comment