# aws-build-badges

This tool automatically generates and hosts status badges (SVG) for all CodeBuild projects and CodePipelines in your account.

## Deployment

- **Stack Name**: `dx-aws-pipeline-badges`
- **Region**: `ca-central-1`

### Create Stack
Only to be performed if the stack is not created yet.

```console
aws cloudformation create-stack \
  --stack-name dx-aws-pipeline-badges \
  --template-body file://aws_build_badges_cf_template.yml \
  --region ca-central-1 \
  --capabilities CAPABILITY_NAMED_IAM \
  --profile <profile-name>
```

### Update existing stack

```console
aws cloudformation update-stack \
  --stack-name dx-aws-pipeline-badges \
  --template-body file://aws_build_badges_cf_template.yml \
  --region ca-central-1 \
  --capabilities CAPABILITY_NAMED_IAM \
  --profile <profile-name>
```

### Delete an existing Stack

```console
aws cloudformation delete-stack \
  --stack-name dx-aws-pipeline-badges \
  --profile <profile-name>
```

## Using the Badges

The tool automatically monitors all resources. You can add badges to your GitHub `README.md` using the following Markdown syntax:

### For CodeBuild Projects
```markdown
![Build Status](https://dx-aws-pipeline-badges-images.s3.ca-central-1.amazonaws.com/<project-name>.svg)
```

### For CodePipelines
```markdown
![Pipeline Status](https://dx-aws-pipeline-badges-images.s3.ca-central-1.amazonaws.com/<pipeline-name>.svg)
```

> [!NOTE]
> Replace `<project-name>` or `<pipeline-name>` with the exact name of your resource in AWS.
