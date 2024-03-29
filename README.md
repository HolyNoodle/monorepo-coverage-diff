# Monorepository coverage diff

## Introduction

This projects aims to provide a way to ease CI test coverage difference based on a `coverage-summary.json` file.

The process of the code is as follow:
- pull base branch (default main)
- run commands to initialize current branch and base branch coverage files (here we should run things like dependency installation, building, testing and outputing the `coverage-summary.json` file)
- run coverage diff between current branch and base branch project by project
- post a comment to the PR that sumarize which project has seen it's coverage changed with collapsible details

## Simple configuration

Example of a easiest github workflow configuration:
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

      # The important part is below
      - uses: holynoodle/monorepo-coverage-diff@v6
        with:
          token: ${{ secrets.GITHUB_TOKEN }} #required to pull the base branch and post the comment in the PR
          base: main # optional, default main
          basePath: /tmp/base # optional, default /tmp/base
          group: MyCoverageGroup # optional, default ''. This is used to separate comments if you are triggering this action multiple times
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

Here is an example of the comment the action will write in the PR. The comment is updated with latest information:

:ramen: Noodly Coverage! :ramen:


These projects have a changing coverage:

| Project |                                                          Lines |                                                     Statements |                                                      Functions |                                                       Branches |
| :------ | -------------------------------------------------------------: | -------------------------------------------------------------: | -------------------------------------------------------------: | -------------------------------------------------------------: |
| project3    | <span style="color:red;font-weight:bold">- 4.18<span> (95.52%) | <span style="color:red;font-weight:bold">- 4.13<span> (95.57%) | <span style="color:red;font-weight:bold">- 4.10<span> (95.08%) | <span style="color:red;font-weight:bold">- 5.17<span> (93.10%) |
    
<details>
  <summary>Coverage diff details</summary>

  
## project1
| File                        |                                Lines |                           Statements |                            Functions |                             Branches |
| :-------------------------- | -----------------------------------: | -----------------------------------: | -----------------------------------: | -----------------------------------: |
| ./src/file1.ts | <span style=""> 0.00<span> (100.00%) | <span style=""> 0.00<span> (100.00%) | <span style=""> 0.00<span> (100.00%) | <span style=""> 0.00<span> (100.00%) |
| ./src/file2.ts    |  <span style=""> 0.00<span> (81.25%) |  <span style=""> 0.00<span> (81.25%) |  <span style=""> 0.00<span> (83.33%) | <span style=""> 0.00<span> (100.00%) |
| ./src/file3.ts      | <span style=""> 0.00<span> (100.00%) | <span style=""> 0.00<span> (100.00%) | <span style=""> 0.00<span> (100.00%) | <span style=""> 0.00<span> (100.00%) |

## project2
| File                                  |                                Lines |                           Statements |                            Functions |                             Branches |
| :------------------------------------ | -----------------------------------: | -----------------------------------: | -----------------------------------: | -----------------------------------: |
| ./src/file1.ts | <span style=""> 0.00<span> (100.00%) | <span style=""> 0.00<span> (100.00%) | <span style=""> 0.00<span> (100.00%) | <span style=""> 0.00<span> (100.00%) |
| ./src/file2.ts | <span style=""> 0.00<span> (100.00%) | <span style=""> 0.00<span> (100.00%) | <span style=""> 0.00<span> (100.00%) | <span style=""> 0.00<span> (100.00%) |

## project3
| File                                  |                                                           Lines |                                                      Statements |                                                       Functions |                                                        Branches |
| :------------------------------------ | --------------------------------------------------------------: | --------------------------------------------------------------: | --------------------------------------------------------------: | --------------------------------------------------------------: |
| ./src/file1                |                            <span style=""> 0.00<span> (100.00%) |                            <span style=""> 0.00<span> (100.00%) |                            <span style=""> 0.00<span> (100.00%) |                             <span style=""> 0.00<span> (91.66%) |
| ./src/file2.ts              | <span style="color:red;font-weight:bold">- 100.00<span> (0.00%) | <span style="color:red;font-weight:bold">- 100.00<span> (0.00%) | <span style="color:red;font-weight:bold">- 83.34<span> (16.66%) | <span style="color:red;font-weight:bold">- 100.00<span> (0.00%) |

</details>

## Advanced configuration

When you want to reduce the number of installs and builds, the action leave you the opportunity to only run diffs
```yml
steps:
  - uses: actions/checkout@v3
    with:
      path: ./branch
  - uses: actions/checkout@v3
    with:
      ref: main
      path: ./base

  - name: Use Node.js
    uses: actions/setup-node@v3

  - run: yarn --frozen-lockfile && yarn build && yarn ci:unit
    working-directory: ./base
  - run: yarn --frozen-lockfile && yarn build && yarn ci:unit
    working-directory: ./branch

  - uses: holynoodle/monorepo-coverage-diff@v6
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      basePath: ./base
      branchPath: ./branch
      projects: |
        project1:path/to/project1
        project2:path/to/project2
        project3:path/to/project3
      diffOnly: true
```