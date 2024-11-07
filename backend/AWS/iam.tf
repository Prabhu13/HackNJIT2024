# Create a file named iam.tf

# IAM Policy for Terraform deployment
resource "aws_iam_policy" "terraform_policy" {
  name        = "terraform-deployment-policy"
  description = "Policy for Terraform to deploy VPC and EC2 resources"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          # VPC related permissions
          "ec2:CreateVpc",
          "ec2:DeleteVpc",
          "ec2:ModifyVpcAttribute",
          "ec2:DescribeVpcs",
          "ec2:CreateTags",
          "ec2:DeleteTags",
          
          # Subnet permissions
          "ec2:CreateSubnet",
          "ec2:DeleteSubnet",
          "ec2:ModifySubnetAttribute",
          "ec2:DescribeSubnets",
          
          # Internet Gateway permissions
          "ec2:CreateInternetGateway",
          "ec2:DeleteInternetGateway",
          "ec2:AttachInternetGateway",
          "ec2:DetachInternetGateway",
          "ec2:DescribeInternetGateways",
          
          # Route Table permissions
          "ec2:CreateRouteTable",
          "ec2:DeleteRouteTable",
          "ec2:CreateRoute",
          "ec2:DeleteRoute",
          "ec2:AssociateRouteTable",
          "ec2:DisassociateRouteTable",
          "ec2:DescribeRouteTables",
          
          # Security Group permissions
          "ec2:CreateSecurityGroup",
          "ec2:DeleteSecurityGroup",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:RevokeSecurityGroupIngress",
          "ec2:AuthorizeSecurityGroupEgress",
          "ec2:RevokeSecurityGroupEgress",
          "ec2:DescribeSecurityGroups",
          
          # EC2 Instance permissions
          "ec2:RunInstances",
          "ec2:TerminateInstances",
          "ec2:DescribeInstances",
          "ec2:ModifyInstanceAttribute",
          "ec2:DescribeInstanceAttribute",
          
          # Volume permissions
          "ec2:CreateVolume",
          "ec2:DeleteVolume",
          "ec2:AttachVolume",
          "ec2:DetachVolume",
          "ec2:DescribeVolumes",
          
          # AMI permissions
          "ec2:DescribeImages",
          
          # Network Interface permissions
          "ec2:DescribeNetworkInterfaces",
          "ec2:CreateNetworkInterface",
          "ec2:DeleteNetworkInterface",
          "ec2:AttachNetworkInterface",
          "ec2:DetachNetworkInterface"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM Role for Terraform
resource "aws_iam_role" "terraform_role" {
  name = "terraform-deployment-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# Attach the policy to the role
resource "aws_iam_role_policy_attachment" "terraform_policy_attach" {
  role       = aws_iam_role.terraform_role.name
  policy_arn = aws_iam_policy.terraform_policy.arn
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# Output the role ARN
output "terraform_role_arn" {
  value = aws_iam_role.terraform_role.arn
}