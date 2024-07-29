# CI/CD Pipeline for Hangman Application

- [CI/CD Pipeline for Hangman Application](#cicd-pipeline-for-hangman-application)
  - [Introduction](#introduction)
  - [Project Overview](#project-overview)
  - [Importance and Benefits](#importance-and-benefits)
  - [Pipeline Overview](#pipeline-overview)
  - [Jobs](#jobs)
  - [Secrets](#secrets)
  - [Conclusion](#conclusion)

## Introduction
This project implements a powerful continuous integration and deployment (CI/CD) pipeline using GitHub Actions, designed to automate the build, push, and deployment processes for a Dockerised Hangman application. By utilising GitHub Actions and AWS services, this pipeline ensures that the Hangman application is consistently and reliably built, pushed to Amazon Elastic Container Registry (ECR), and deployed to an Amazon EC2 instance.


![Screenshot 2024-07-24 171804](https://github.com/user-attachments/assets/43478d5c-86e1-42a3-a4ac-ce2d0db2dc37) ![Screenshot 2024-07-24 171650](https://github.com/user-attachments/assets/98680649-ef92-4875-b1a9-837672dcfc30)

***These images demonstrate the successful deployment of the Dockerised Hangman application, showcasing the effectiveness and reliability of the CI/CD pipeline.***

## Project Overview

The Hangman application is a simple web-based game that allows users to play the classic Hangman game. The application is containerised using Docker, which enables consistent runtime environments and simplifies deployment.

## Importance and Benefits

**Automation:** Streamlines the process of building, testing, and deploying applications.
**Consistency:** Ensures the application runs in the same environment across different stages of development and production.
**Scalability:** Makes it easier to scale the application by deploying containers across multiple instances.
**Efficiency:** Reduces manual intervention, allowing developers to focus on coding rather than deployment logistics.

## Pipeline Overview
The pipeline is triggered on every push to the **main** branch. It consists of two main jobs:

1. **Build and Push Docker Image**
2. **Deploy Docker Container**


## Jobs

1. **Build and Push Docker Image**
   This job builds a Docker image from the code in the repository and pushes it to AWS ECR.
   - Runs on: ubuntu-latest
   - Steps:
 - Checkout code:
 ```
  - name: Checkout code
  uses: actions/checkout@v2
 ```

 This step uses the GitHub action actions/checkout@v2 to pull the latest code from the repository. This is crucial as it ensures that the pipeline works with the most recent codebase.

2. **Configure AWS credentials:**

 ```
   - name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_REGION }}

```

This step configures the AWS credentials using aws-actions/configure-aws-credentials@v1. It is essential for authenticating and authorising the pipeline to interact with AWS services.

3. **Log in to Amazon ECR:**
```
- name: Log in to Amazon ECR
  run: |
    aws ecr get-login-password --region ${{ secrets.AWS_REGION }} | docker login --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com

```

This step logs in to Amazon ECR. It is necessary for pushing Docker images to the ECR repository.

4. **Build and Push Docker Image:**
```
- name: Build and Push Docker Image
  run: |
    docker build -t ${{ secrets.ECR_REPO_NAME }} .
    docker tag ${{ secrets.ECR_REPO_NAME }}:latest ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/${{ secrets.ECR_REPO_NAME }}:latest
    docker push ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/${{ secrets.ECR_REPO_NAME }}:latest

```
This step builds the Docker image, tags it, and pushes it to the specified ECR repository. It is important because it prepares the application for deployment by containerising it and storing the container image in a repository.

2. **Deploy Docker Container**
This job deploys the Docker container to an EC2 instance.

- Runs on: ubuntu-latest
- Needs: build-and-push

- Steps:

1. **Checkout Code:**

```
- name: Checkout Code
  uses: actions/checkout@v2

```
This step uses the GitHub action actions/checkout@v2 to pull the latest code from the repository. It ensures that the deployment uses the most recent codebase.

2. **Configure AWS credentials:**

```
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_REGION }}

```

This step configures the AWS credentials using aws-actions/configure-aws-credentials@v1. It is essential for authenticating and authorising the pipeline to interact with AWS services.

3. **Set up SSH:**


```- name: Set up SSH
  uses: webfactory/ssh-agent@v0.5.3
  with:
    ssh-private-key: ${{ secrets.SSH_KEY }}
```

This step sets up SSH using webfactory/ssh-agent@v0.5.3. It is necessary for securely connecting to the EC2 instance.

4. **Install Docker on EC2 Instance & Deploy Docker container:**

```
- name: Install Docker on EC2 Instance & Deploy Docker container
  uses: appleboy/ssh-action@v0.1.7 
  with:
    host: ${{ secrets.ELASTIC_IP }}
    username: ec2-user
    key: ${{ secrets.SSH_KEY }}
    script: |
      sudo yum update -y
      sudo yum install -y docker
      sudo systemctl start docker
      sudo systemctl enable docker
      sudo usermod -aG docker $USER
      newgrp docker
      aws ecr get-login-password --region ${{ secrets.AWS_REGION }} | docker login --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com
      docker pull ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/${{ secrets.ECR_REPO_NAME }}:latest
      docker stop hangman-game || true
      docker rm hangman-game || true
      docker run -d --name hangman-game -p 80:80 ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/${{ secrets.ECR_REPO_NAME }}:latest

```

> [!NOTE]  
> Initially, I faced **connectivity issues** when restarting the EC2 instances due to changing IP addresses.
> To **ensure consistent connectivity** to the EC2 instance, I have used an Elastic IP address. 
> An Elastic IP is a static IPv4 address associated with your AWS account that can be easily remapped to different instances within the same region. 
> This ensures that the instance's IP address **remains constant** even if the instance is stopped and restarted, which is crucial for maintaining a reliable connection during the deployment process.


This step uses appleboy/ssh-action@v0.1.7 to connect to the EC2 instance and execute a series of commands:

- **Update the EC2 instance**: Ensures the instance is up-to-date.
- **Install Docker:** Installs Docker on the instance.
- **Start and enable Docker:** Starts the Docker service and enables it to start on boot.
- **Add the ec2-user to the Docker group:** Allows the user to run Docker commands.
- **Log in to Amazon ECR:** Authenticates Docker to the ECR registry.
- **Pull the latest Docker image:** Fetches the latest Docker image from ECR.
- **Stop any existing container named hangman-game:** Stops the currently running container if it exists.
- **Remove any existing container named hangman-game:** Removes the stopped container if it exists.
- **Run the Docker container:** Starts a new container with the latest image.
  
## Secrets
- The following secrets need to be configured in the GitHub repository settings:

    - **AWS_ACCESS_KEY:** AWS access key ID.
    - **AWS_SECRET_ACCESS_KEY:** AWS secret access key.
    - **AWS_REGION:** AWS region.
    - **AWS_ACCOUNT_ID:** AWS account ID.
    - **ECR_REPO_NAME:** Name of the ECR repository.
    - **SSH_KEY:** SSH private key for connecting to the EC2 instance.
    - **ELASTIC_IP:** Elastic IP address of the EC2 instance.

## Conclusion
This CI/CD pipeline ensures that the Hangman application is automatically built, pushed, and deployed in a consistent and reliable manner. By leveraging GitHub Actions and AWS services, the deployment process is streamlined, scalable, and efficient, allowing developers to focus on improving the application rather than managing the deployment infrastructure.

With this pipeline, you can experience the benefits of modern DevOps practices, gaining insights into how continuous integration and continuous deployment can enhance your development workflow. 
