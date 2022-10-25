# Lambda container to handle "contact us" form

Lambda function that receives a POST of a "contact us" form and generates an
email via AWS SES.

This repository contains a Dockerfile so you can deploy the Lambda function as
a Docker image.

> Note: The handler assumes you are calling the Lambda function directly by
> configuring a Lambda function URL rather than proxying through an API Gateway.

## Configuration

The handler assumes you can configured a Lambda environment variable named
`ValidatedEmailAddress` and set its value to a valid email address that you have
[pre-verified with AWS SES](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html#verify-email-addresses-procedure).

## Build

The `buildspec.yml` file contains configuration for AWS CodeBuild. It builds a
Docker image based on AWS' Lambda image and then deploys to an ECR repository
named `aws-lambda-contact-us`.

## Tests

Run tests via `npm run test`.

## Helper scripts

The `shell-scripts` directory contains several scripts for managing the Docker
image lifecycle.
