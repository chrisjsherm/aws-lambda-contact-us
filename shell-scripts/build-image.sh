AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_DEFAULT_REGION=$(aws configure get region)
IMAGE_REPO_NAME=aws-lambda-contact-us
IMAGE_TAG=latest

docker build -t ${IMAGE_REPO_NAME}:${IMAGE_TAG} . --progress=tty
docker tag ${IMAGE_REPO_NAME}:${IMAGE_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}:${IMAGE_TAG}
