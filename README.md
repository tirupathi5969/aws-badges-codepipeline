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

The tool automatically monitors all resources and generates SVGs. You can add them to your `README.md`.

### Metadata Badge Paths
The engine generates 4 types of badges for every resource:
1. **Status**: `https://<DOMAIN>/<NAME>/<NAME>.svg`
2. **Commit**: `https://<DOMAIN>/<NAME>/<NAME>-commitId.svg`
3. **Timer**: `https://<DOMAIN>/<NAME>/<NAME>-timestamp.svg`
4. **Author**: `https://<DOMAIN>/<NAME>/<NAME>-author.svg`

---

## 🚀 Dashboard Generator (Recommended)

Instead of editing URLs manually, use the included script to generate a full CI/CD dashboard table:

```bash
bash scripts/generate-readme-table.sh <domain> <pipeline-name>
```

### Example Output:
| Stage | Activity | Current Status | Last Updated | 🔑 Commit | 👤 Author |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01. Source** | 📡 Listener | ![Status](https://d123.cloudfront.net/my-pipeline/my-pipeline-Source.svg) | ![Time](https://d123.cloudfront.net/my-pipeline/my-pipeline-Source-timestamp.svg) | ![Commit](https://d123.cloudfront.net/my-pipeline/my-pipeline-Source-commitId.svg) | ![Author](https://d123.cloudfront.net/my-pipeline/my-pipeline-Source-author.svg) |

---
<sub>*Status badges feature live **animated progress bars** during active deployments.*</sub>
