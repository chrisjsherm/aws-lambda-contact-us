read -p "Lambda function URL: " LAMBDA_FUNCTION_URL
read -p "From (name): " FROM_NAME
read -p "From (email address): " FROM_EMAIL_ADDRESS
read -p "Subject: " SUBJECT
read -p "Message: " MESSAGE

JSON_PAYLOAD=${JSON_PAYLOAD:-{\"fromName\": \"${FROM_NAME}\", \"fromEmailAddress\": \"${FROM_EMAIL_ADDRESS}\", \"subject\": \"${SUBJECT}\", \"message\": \"${MESSAGE}\"}}

curl -XPOST "${LAMBDA_FUNCTION_URL}" \
  -H 'Content-Type: application/json' \
  -d "${JSON_PAYLOAD}"
