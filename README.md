# Lambda Docker image to handle "contact us" form

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

## CloudFormation

This repository is designed to be referenced by a
[contact form handler CloudFormation template](https://github.com/chrisjsherm/aws-cf-contact-form-handler).
To use with the template, fork this repository and
use the HTTPS clone link to set the `GitHubSourceHTTPS` parameter in the
CloudFormation template.

## Development

Ensure you have an `~/.aws/credentials` file, Docker running, and Node/NPM
installed. Rename `docker-compose.example.yml` to `docker-compose.yml` and
adjust the environment variables in `docker-compose.yml` as needed.

1. Run `npm install`. This installs dependencies.
2. Run `docker compose up -d`. This starts the Lambda Fn container.
3. Run `npm run build:live`. This starts TypeScript transpilation in watch mode and
   starts a Docker container. When you modify code in the `src` directory,
   the container will briefly go down while it restarts.
4. You can hit the Lambda endpoint with:

```
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" \
  -d '{"fromName": "Jane", "fromEmailAddress": "jdoe@mail.com", "subject": "Party", "message": "Party this weekend!"'
```

5. Run `docker compose down`. This stops the Lambda Fn container.

To see log statements, run `docker compose logs web`.

## Build

The `.github/workflows/pr-continuous-integration.yml` file contains configuration
to enforce code quality when creating a pull request on GitHub.

The `buildspec.yml` file contains configuration for AWS CodeBuild. It builds a
Docker image based on AWS' Lambda image and then deploys to an ECR repository
named `aws-lambda-contact-us` when a pull request is merged to the `master`
branch.

The `buildspec.yml` file has several environment variables it assumes are set
by CloudFormation. If you do not use the CloudFormation template referenced
above, you will need to take care of setting these environment variables.

## Tests

Run tests via `npm run test`.

## Helper scripts

The `shell-scripts` directory contains several scripts for managing the Docker
image lifecycle.
