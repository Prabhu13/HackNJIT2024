variable "aws_deployment_role" {
  description = "ARN of the IAM role to assume"
  type        = string
  default     = ""  # Will be populated by the terraform_role_arn output
}
variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"  # or your preferred region
}
variable "availability_zone" {
  description = "Availability Zone"
  type        = string
  default     = "us-east-1a"
}

variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
  default     = "my-key-pair"  # Replace with your key pair name
}