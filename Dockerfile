FROM node:16-alpine AS builder

# Install NPM dependencies for function
COPY package*.json ./app/
WORKDIR /app
RUN npm clean-install

# Copy source files
COPY tsconfig.json .
COPY src src

# Transpile TypeScript to JavaScript
RUN npm run build

# Create runtime stage
FROM amazon/aws-lambda-nodejs:16

# Copy transpiled code
COPY --from=builder /app/dist ${LAMBDA_TASK_ROOT}

# Install only production dependencies
COPY package*.json ${LAMBDA_TASK_ROOT}/
RUN npm clean-install --omit=dev

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "app.handler" ]  