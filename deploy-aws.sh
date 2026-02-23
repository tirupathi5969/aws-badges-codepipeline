#!/bin/bash
set -e

# --- Configuration ---
STACK_NAME="central-badge-tool"
APP_NAME="dx-aws-pipeline-badges"
REGION="${AWS_DEFAULT_REGION:-ca-central-1}"
TEMPLATE_FILE="aws_build_badges_cf_template.yml"

echo "🚀 Starting automated deployment for $APP_NAME..."

# 1. Build Services
echo "📦 Building services..."
export NODE_OPTIONS=--openssl-legacy-provider
bash build_services_prod

# 2. Deploy/Update CloudFormation Stack
# This creates the infrastructure (Buckets, Roles, etc.)
echo "🏗️  Deploying/Updating CloudFormation stack: $STACK_NAME..."
aws cloudformation deploy \
    --stack-name "$STACK_NAME" \
    --template-file "$TEMPLATE_FILE" \
    --parameter-overrides AppName="$APP_NAME" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "$REGION"

# 3. Get the Lambda Zips Bucket name from the stack
echo "🔍 Retrieving Lambda Zips Bucket..."
ZIPS_BUCKET=$(aws cloudformation describe-stack-resource \
    --stack-name "$STACK_NAME" \
    --logical-resource-id LambdaZipsBucket \
    --query 'StackResourceDetail.PhysicalResourceId' \
    --output text \
    --region "$REGION")

if [ -z "$ZIPS_BUCKET" ]; then
    echo "❌ Error: Could not find LambdaZipsBucket resource."
    exit 1
fi

echo "✅ Zips Bucket found: $ZIPS_BUCKET"

# 4. Upload ZIPs to S3
echo "📤 Uploading build artifacts to S3..."
aws s3 cp services/status-badges/dist/dist_status_badges.zip "s3://$ZIPS_BUCKET/dist_status_badges.zip" --region "$REGION"
aws s3 cp services/commit-badges/dist/dist_commit_badges.zip "s3://$ZIPS_BUCKET/dist_commit_badges.zip" --region "$REGION"

# 5. Refresh Lambda Function Code
# This ensures the Lambdas immediately use the newly uploaded code
echo "🔄 Refreshing Lambda function code..."

aws lambda update-function-code \
    --function-name "$APP_NAME-status" \
    --s3-bucket "$ZIPS_BUCKET" \
    --s3-key dist_status_badges.zip \
    --region "$REGION" > /dev/null

aws lambda update-function-code \
    --function-name "$APP_NAME-commit-id" \
    --s3-bucket "$ZIPS_BUCKET" \
    --s3-key dist_commit_badges.zip \
    --region "$REGION" > /dev/null

echo "🎉 Deployment Successful!"
echo "--------------------------------------------------"
echo "Stack: $STACK_NAME"
echo "Region: $REGION"
echo "Badges Bucket: $APP_NAME-images"
echo "--------------------------------------------------"
