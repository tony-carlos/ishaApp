#!/usr/bin/env python3
"""
Setup script for IsherCare Face Analysis API
"""

import os
import sys
import subprocess
import platform

def run_command(command):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {command}")
        print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def install_system_dependencies():
    """Install system dependencies"""
    print("Installing system dependencies...")
    
    system = platform.system().lower()
    
    if system == "linux":
        # Ubuntu/Debian
        commands = [
            "sudo apt-get update",
            "sudo apt-get install -y python3-pip python3-dev",
            "sudo apt-get install -y libopencv-dev python3-opencv",
            "sudo apt-get install -y libgl1-mesa-glx libglib2.0-0"
        ]
    elif system == "darwin":  # macOS
        commands = [
            "brew install python3",
            "brew install opencv"
        ]
    elif system == "windows":
        print("Windows detected. Please install dependencies manually:")
        print("1. Install Python 3.8+ from python.org")
        print("2. Install Microsoft Visual C++ Build Tools")
        return True
    else:
        print(f"Unsupported system: {system}")
        return False
    
    for cmd in commands:
        if not run_command(cmd):
            print(f"Failed to run: {cmd}")
            return False
    
    return True

def create_virtual_environment():
    """Create and activate virtual environment"""
    print("Creating virtual environment...")
    
    if not run_command("python3 -m venv venv"):
        return False
    
    # Activation command depends on OS
    system = platform.system().lower()
    if system == "windows":
        activate_cmd = "venv\\Scripts\\activate"
    else:
        activate_cmd = "source venv/bin/activate"
    
    print(f"Virtual environment created. Activate it with: {activate_cmd}")
    return True

def install_python_dependencies():
    """Install Python dependencies"""
    print("Installing Python dependencies...")
    
    # Use pip from virtual environment if it exists
    pip_cmd = "venv/bin/pip" if os.path.exists("venv/bin/pip") else "pip3"
    
    commands = [
        f"{pip_cmd} install --upgrade pip",
        f"{pip_cmd} install -r requirements.txt"
    ]
    
    for cmd in commands:
        if not run_command(cmd):
            return False
    
    return True

def create_directories():
    """Create necessary directories"""
    print("Creating directories...")
    
    dirs = [
        "logs",
        "temp",
        "uploads",
        "models",
        "cache"
    ]
    
    for dir_name in dirs:
        os.makedirs(dir_name, exist_ok=True)
        print(f"✅ Created directory: {dir_name}")
    
    return True

def create_config_file():
    """Create configuration file"""
    print("Creating configuration file...")
    
    config_content = """# IsherCare Face Analysis API Configuration

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# API Configuration
API_VERSION=1.0.0
MAX_UPLOAD_SIZE=10MB
MAX_CONCURRENT_REQUESTS=10

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/api.log

# Analysis Configuration
ENABLE_FACE_DETECTION=True
ENABLE_SKIN_ANALYSIS=True
ENABLE_FACIAL_FEATURES=True
ENABLE_AGE_ESTIMATION=True
ENABLE_EXPRESSION_ANALYSIS=True

# Performance Configuration
ENABLE_CACHING=True
CACHE_EXPIRY_SECONDS=3600
ENABLE_PARALLEL_PROCESSING=True

# Security Configuration
CORS_ORIGINS=*
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
"""
    
    with open(".env", "w") as f:
        f.write(config_content)
    
    print("✅ Created .env configuration file")
    return True

def test_installation():
    """Test if installation was successful"""
    print("Testing installation...")
    
    try:
        # Test imports
        import fastapi
        import uvicorn
        import cv2
        import mediapipe
        import numpy
        import PIL
        import sklearn
        import skimage
        import scipy
        
        print("✅ All required packages imported successfully")
        
        # Test OpenCV
        test_image = numpy.zeros((100, 100, 3), dtype=numpy.uint8)
        gray = cv2.cvtColor(test_image, cv2.COLOR_BGR2GRAY)
        print("✅ OpenCV working correctly")
        
        # Test MediaPipe
        mp_face_detection = mediapipe.solutions.face_detection
        print("✅ MediaPipe working correctly")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up IsherCare Face Analysis API...")
    print("=" * 50)
    
    steps = [
        ("Checking Python version", check_python_version),
        ("Installing system dependencies", install_system_dependencies),
        ("Creating virtual environment", create_virtual_environment),
        ("Installing Python dependencies", install_python_dependencies),
        ("Creating directories", create_directories),
        ("Creating configuration file", create_config_file),
        ("Testing installation", test_installation)
    ]
    
    for step_name, step_func in steps:
        print(f"\n📋 {step_name}...")
        if not step_func():
            print(f"❌ Setup failed at: {step_name}")
            sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\nTo start the API server:")
    print("1. Activate the virtual environment:")
    
    system = platform.system().lower()
    if system == "windows":
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    
    print("2. Start the server:")
    print("   python main.py")
    print("   or")
    print("   uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
    print("\n3. Open your browser and go to:")
    print("   http://localhost:8000/docs")
    print("   (for API documentation)")

if __name__ == "__main__":
    main() 