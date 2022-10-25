read -p "Lambda function URL: " LAMBDA_FUNCTION_URL
read -p "From (email address): " FROM_EMAIL_ADDRESS
read -p "Subject: " SUBJECT
read -p "Message: " MESSAGE

JSON_PAYLOAD=${JSON_PAYLOAD:-{\"fromEmailAddress\": \"${FROM_EMAIL_ADDRESS}\", \"subject\": \"${SUBJECT}\", \"message\": \"${MESSAGE}\"}}

curl -XPOST "${LAMBDA_FUNCTION_URL}" \
  -H 'Content-Type: application/json' \
  -d "${JSON_PAYLOAD}"
