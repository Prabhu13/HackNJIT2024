python3 -m venv APIs
source APIs/bin/activate


pip install -r requirements.txt
xattr -d com.apple.quarantine chromedriver


terraform init
terraform plan
terraform apply


curl -X POST "http://52.23.220.166:8000/compare/" \
     -F "file1=@/Users/prabhakaryadav/Documents/Projects/HackNJIT2024/backend/given_images/easy/astronaut-riding-horse-surface-moon_853566-184.jpg" \
     -F "file2=@/Users/prabhakaryadav/Documents/Projects/HackNJIT2024/backend/images/aa6ff04aeb8040a7a94e6dcb28c4937a.png"


curl -X POST "http://52.23.220.166:8000/compare/" \
     -F "file1=@/Users/prabhakaryadav/Documents/Projects/HackNJIT2024/backend/images/aa6ff04aeb8040a7a94e6dcb28c4937a.png" \
     -F "file2=@/Users/prabhakaryadav/Documents/Projects/HackNJIT2024/backend/images/2e7fb924d9f949fe8f2957510277af6a.png"


curl -X POST "http://localhost:8000/generate_image"      -H "Content-Type: application/json"      -d '{"prompt": "Astronaut riding a horse there is moon and land with brown dust kind of mars like planet", "return_format": "base64"}'
