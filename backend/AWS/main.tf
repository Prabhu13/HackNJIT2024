terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  assume_role {
    duration_seconds = 3600
    session_name = "creating-terraform-for-ec2"
    role_arn = var.aws_deployment_role
  }
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "image-comparison-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = var.availability_zone  # Using the variable

  tags = {
    Name = "image-comparison-subnet"
  }
}


# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "image-comparison-igw"
  }
}

# Route Table
resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "image-comparison-rt"
  }
}

resource "aws_route_table_association" "main" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.main.id
}

# Security Group
resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh"
  description = "Allow SSH inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_ssh"
  }
}
resource "aws_instance" "image_comparison" {
  # Ubuntu 20.04 LTS in us-east-1
  ami           = "ami-06aa3f7caf3a30282"  # Updated AMI ID for us-east-1
  instance_type = "t2.xlarge"
  key_name      = var.key_name  # Add SSH key pair

  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.allow_ssh.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size = 50  # GB
    volume_type = "gp2"
  }

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y python3-pip python3-dev build-essential
              apt-get install -y libsm6 libxext6 libxrender-dev
              apt-get install -y python3-opencv
              
              # Create directory for the application
              mkdir -p /opt/image-comparison
              cd /opt/image-comparison
              
              # Install required packages
              pip3 install numpy opencv-python Pillow scikit-image tensorflow ImageHash scikit-learn

              # Copy application files (you'll need to implement file transfer separately)
              echo "System setup complete"
              EOF

  tags = {
    Name = "image-comparison-instance"
  }

  # Add dependency on route table association to ensure networking is ready
  depends_on = [
    aws_route_table_association.main
  ]
}
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}
output "instance_public_ip" {
  value = aws_instance.image_comparison.public_ip
}