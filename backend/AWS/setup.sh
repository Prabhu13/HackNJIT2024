#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install system dependencies
sudo apt-get install -y \
    python3-pip \
    python3-dev \
    build-essential \
    libsm6 \
    libxext6 \
    libxrender-dev \
    python3-opencv

# Create application directory
sudo mkdir -p /opt/image-comparison
cd /opt/image-comparison

# Copy application files
sudo cp image_comparison.py /opt/image-comparison/
sudo cp requirements.txt /opt/image-comparison/

# Install Python dependencies
sudo pip3 install -r requirements.txt

# Set up logging directory
sudo mkdir -p /var/log/image-comparison
sudo chmod 755 /var/log/image-comparison

# Create a system service
sudo tee /etc/systemd/system/image-comparison.service << EOF
[Unit]
Description=Image Comparison Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/image-comparison
ExecStart=/usr/bin/python3 /opt/image-comparison/image_comparison.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable image-comparison
sudo systemctl start image-comparison

echo "Setup complete!"