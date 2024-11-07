python3 -m venv APIs
source APIs/bin/activate


pip install -r requirements.txt
xattr -d com.apple.quarantine chromedriver


terraform init
terraform plan
terraform apply