#!/bin/bash

# dashboard-gen.sh
# Usage: bash dashboard-gen.sh <repo-name> <domain> <pipeline-name>

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <repo-name> <domain> <pipeline-name>"
    echo "Example: $0 testing-one-git-badge dsikuhnjgrtfw.cloudfront.net my-pipeline-123"
    exit 1
fi

REPO_NAME=$1
DOMAIN=$(echo $2 | sed 's|https://||' | sed 's|/||g')
PIPELINE=$3

cat <<EOF
# 🚀 $REPO_NAME | CI/CD Dashboard

> **Real-time Deployment Monitoring**
> This dashboard provides a live, visual representation of the current state of our deployment pipeline for this microservice.

### 📉 Pipeline Architecture

\`\`\`mermaid
graph LR
    S((Source)) --> B(Build) --> D(Dev) --> ST(Staging) --> U(UAT) --> P((Production))
    
    style S fill:#f3f4f6,stroke:#333
    style P fill:#f3f4f6,stroke:#333
\`\`\`

### 📊 Live Stage Monitoring

| Stage | Activity | Current Status | Last Updated | 🔑 Commit | 👤 Author |
| :--- | :--- | :--- | :--- | :--- | :--- |
EOF

STAGES=("Source" "Build" "DevDeploy" "StagingDeploy" "UATDeploy" "ProductionDeploy")
LABELS=("01. Source" "02. Build" "03. Dev" "04. Staging" "05. UAT" "06. Production")
ACTIVITIES=("📡 Listener" "🏗️ Compile" "🧪 Deploy" "🚀 Deploy" "🚥 Review" "💎 Live")

for i in "${!STAGES[@]}"; do
    STAGE=${STAGES[$i]}
    LABEL=${LABELS[$i]}
    ACT=${ACTIVITIES[$i]}
    
    BASE_URL="https://$DOMAIN/$PIPELINE/$PIPELINE-$STAGE"
    
    echo "| **$LABEL** | $ACT | ![Status]($BASE_URL.svg) | ![Time]($BASE_URL-timestamp.svg) | ![Commit]($BASE_URL-commitId.svg) | ![Author]($BASE_URL-author.svg) |"
done

cat <<EOF

---

### 🛡️ Smart Infrastructure
*   **Discovery**: Automatic repository & README mapping via AWS API.
*   **Performance**: Native Camo Purge Protocol for sub-second updates.
*   **Security**: Private S3 storage via CloudFront OAC.

---
<sub>*Status badges feature live **animated progress bars** during active deployments.*</sub>
EOF
