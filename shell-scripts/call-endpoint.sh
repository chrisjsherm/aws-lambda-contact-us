read -p "Lambda function URL: " LAMBDA_FUNCTION_URL
read -p "JSON payload: [{}]" JSON_PAYLOAD

JSON_PAYLOAD=${JSON_PAYLOAD:-{}}

curl -XPOST "${LAMBDA_FUNCTION_URL}" \
  -H 'Content-Type: application/json' \
  -d "${JSON_PAYLOAD}"
