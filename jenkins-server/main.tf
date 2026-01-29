terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source = "hashicorp/tls"
    }
    local = {
      source = "hashicorp/local"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# --- SSH Key ---
resource "tls_private_key" "jenkins_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "jenkins_key" {
  key_name   = "jenkins-server-key"
  public_key = tls_private_key.jenkins_key.public_key_openssh
}

resource "local_file" "jenkins_pem" {
  content         = tls_private_key.jenkins_key.private_key_pem
  filename        = "jenkins-server-key.pem"
  file_permission = "0400"
}

# --- Security Group ---
resource "aws_security_group" "jenkins_sg" {
  name = "jenkins-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- AMI ---
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# --- Jenkins EC2 ---
resource "aws_instance" "jenkins" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t3.small"
  key_name               = aws_key_pair.jenkins_key.key_name
  vpc_security_group_ids = [aws_security_group.jenkins_sg.id]

  user_data = <<-EOF
    #!/bin/bash
    set -e

    yum update -y
    yum install -y java-21-amazon-corretto git docker

    systemctl enable docker
    systemctl start docker

    wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
    rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
    yum install -y jenkins

    usermod -aG docker jenkins

    systemctl enable jenkins
    systemctl restart jenkins
  EOF

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "Jenkins-Server"
  }
}

output "server_public_ip" {
  value = aws_instance.jenkins.public_ip
}

output "jenkins_url" {
  value = "http://${aws_instance.jenkins.public_ip}:8080"
}
