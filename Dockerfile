################ Dev stage #######################
FROM amazon/aws-lambda-nodejs:18 as dev

# Set the CMD to your handler (filename.handler-fn-name)
CMD [ "app.handler" ] 

################ Build stage #########################
FROM node:18-alpine AS builder

# Install NPM dependencies for function
WORKDIR /app
COPY tsconfig.json package*.json ./
RUN npm clean-install --ignore-scripts

# Copy source files
COPY src src

# Transpile TypeScript to JavaScript
RUN npm run build

################ Runtime stage #######################
FROM amazon/aws-lambda-nodejs:18 as prod

# Install only production dependencies
COPY package*.json ${LAMBDA_TASK_ROOT}/
RUN npm clean-install --ignore-scripts --omit=dev

# Copy transpiled code
COPY --from=builder /app/dist ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler (filename.handler-fn-name)
CMD [ "app.handler" ] 
