# Lambda Docker image to handle "contact us" form

![Coverage](https://raw.githubusercontent.com/gist/chrisjsherm/6f03529f7bc37ac7720e5d9680b5894d/raw/348a16a97be20dfec38249bd3e0882eaff6054cd/aws-lambda-contact-us_coverage.svg)

Handle a POST of a "contact us" form and generate an email with its contents via
AWS Simple Email Service (SES) using this Lambda Function.

This repository contains a Dockerfile for deploying the Lambda function as a
Docker image.

> Note: The handler assumes you are calling the Lambda function directly by
> configuring a Lambda function URL rather than proxying through an API Gateway.

## Configuration

The handler assumes you configured a Lambda environment variable named
`ValidatedEmailAddress` and set its value to a valid email address that you have
[pre-verified with AWS SES](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html#verify-email-addresses-procedure).

The JSON payload of the POST request must match the shape of
`src/models/contact-form-us.interface.ts`.

There is a GitHub Action that generates a test coverage badge when you push to
the `master` branch. For the Action to work, you need to:

1. Create a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
   and give it access to GitHub Gists.
2. In this forked repository, create an Actions secret with the name `TOKEN`
   and set the value to your personal access token.
3. Create a Gist, and update the `gist_id` in this repository's
   `.github/workflows/push-readme-badge.yml` file with the Gist ID.

## CloudFormation

This repository is designed to be referenced by a
[contact form handler CloudFormation template](https://github.com/chrisjsherm/aws-cf-contact-form-handler). To use with the template, fork this repository and
use the HTTPS clone link to set the `GitHubSourceHTTPS` parameter in the
CloudFormation template.

## Build

The `buildspec.yml` file contains configuration for AWS CodeBuild. It builds a
Docker image based on AWS' Lambda image and then deploys to an ECR repository
named `aws-lambda-contact-us`.

The `buildspec.yml` file has several environment variables it assumes are set
by CloudFormation. If you do not use the CloudFormation template referenced
above, you will need to take care of setting these environment variables.

## Tests

Run tests via `npm run test`.

## Helper scripts

The `shell-scripts` directory contains several scripts for managing the Docker
image lifecycle.
