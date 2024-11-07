# Configure AWS Provider
provider "aws" {
  region = "us-east-1"  # Change to your desired region
}

# Get existing VPC and subnet information
data "aws_vpc" "existing" {
  id = var.vpc_id
}

data "aws_subnet" "existing" {
  id = var.subnet_id
}

# Get the existing instance details
data "aws_instance" "existing" {
  instance_id = var.existing_instance_id
}

# Create an AMI from the existing instance
resource "aws_ami_from_instance" "existing_setup" {
  name               = "existing-setup-ami"
  source_instance_id = data.aws_instance.existing.id
  
  tags = {
    Name = "Existing Setup AMI"
  }
}

# Create a new security group (or use existing one)
resource "aws_security_group" "allow_access" {
  name        = "allow_access"
  description = "Security group for upgraded instance"
  vpc_id      = data.aws_vpc.existing.id

  # Copy existing security group rules
  dynamic "ingress" {
    for_each = data.aws_instance.existing.vpc_security_group_ids
    content {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

locals {
  # Safely get the root volume size from the existing instance
  existing_root_volume_size = try(
    [for device in data.aws_instance.existing.root_block_device : device.volume_size][0],
    100
  )
}

# Launch new g5.4xlarge instance
resource "aws_instance" "upgraded" {
  ami           = aws_ami_from_instance.existing_setup.id
  instance_type = "g5.4xlarge"
  subnet_id     = data.aws_subnet.existing.id

  vpc_security_group_ids = [aws_security_group.allow_access.id]
  
  root_block_device {
    volume_size = local.existing_root_volume_size
    volume_type = "gp3"
  }

  tags = merge(
    data.aws_instance.existing.tags,
    {
      Name = "Upgraded-Instance"
    }
  )
}

# Variables
variable "vpc_id" {
  description = "ID of the existing VPC"
  type        = string
}

variable "subnet_id" {
  description = "ID of the existing subnet"
  type        = string
}

variable "existing_instance_id" {
  description = "ID of the existing EC2 instance"
  type        = string
}

# Outputs
output "new_instance_id" {
  value = aws_instance.upgraded.id
}

output "new_instance_public_ip" {
  value = aws_instance.upgraded.public_ip
}