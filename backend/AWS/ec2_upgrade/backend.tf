terraform {
  backend "local" {
    path = "terraform_upgrade.tfstate"  # Different state file
  }
}