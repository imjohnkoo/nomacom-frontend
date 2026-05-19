#!/bin/bash
# nomacom-admin EC2 cloud-init bootstrap.
# Installs Docker, AWS CLI v2, CodeDeploy agent, and writes /app/app-name.conf.
# Logs to /var/log/cloud-init-output.log on the instance.
set -euxo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get install -y \
  ca-certificates \
  curl \
  unzip \
  ruby-full \
  docker.io

systemctl enable --now docker
usermod -aG docker ubuntu

# AWS CLI v2 (needed by after_deploy.sh for ssm get-parameter)
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/awscliv2.zip /tmp/aws

# CodeDeploy agent
cd /home/ubuntu
curl -fsSL "https://aws-codedeploy-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/latest/install" -o install
chmod +x install
./install auto
rm -f install
systemctl enable --now codedeploy-agent

# /app/app-name.conf — required by before_deploy.sh / after_deploy.sh
mkdir -p /app
echo "nomacom-admin" > /app/app-name.conf
chown -R ubuntu:ubuntu /app
