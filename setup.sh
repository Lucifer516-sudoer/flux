#!/bin/bash

# TradeJournal - Linux Setup Script
# Automated setup for the futuristic trading journal application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
echo "████████╗██████╗  █████╗ ██████╗ ███████╗     ██╗ ██████╗ ██╗   ██╗██████╗ ███╗   ██╗ █████╗ ██╗     "
echo "╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝     ██║██╔═══██╗██║   ██║██╔══██╗████╗  ██║██╔══██╗██║     "
echo "   ██║   ██████╔╝███████║██║  ██║█████╗       ██║██║   ██║██║   ██║██████╔╝██╔██╗ ██║███████║██║     "
echo "   ██║   ██╔══██╗██╔══██║██║  ██║██╔══╝  ██   ██║██║   ██║██║   ██║██╔══██╗██║╚██╗██║██╔══██║██║     "
echo "   ██║   ██║  ██║██║  ██║██████╔╝███████╗╚█████╔╝╚██████╔╝╚██████╔╝██║  ██║██║ ╚████║██║  ██║███████╗"
echo "   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝ ╚════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝"
echo "                                                                                                        "
echo -e "${YELLOW}🚀 Futuristic Trading Journal - Automated Linux Setup${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}❌ Please don't run this script as root. Run as a regular user.${NC}"
    exit 1
fi

# Detect distribution
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
        VERSION=$VERSION_ID
    else
        echo -e "${RED}❌ Cannot detect Linux distribution${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Detected: $PRETTY_NAME${NC}"
}

# Install system dependencies
install_system_deps() {
    echo -e "${BLUE}📦 Installing system dependencies...${NC}"
    
    case $DISTRO in
        ubuntu|debian)
            sudo apt update
            sudo apt install -y curl wget git python3 python3-pip python3-venv nodejs npm mongodb supervisor nginx
            ;;
        fedora|rhel|centos)
            sudo dnf install -y curl wget git python3 python3-pip nodejs npm mongodb-server supervisor nginx
            ;;
        arch|manjaro)
            sudo pacman -S --noconfirm curl wget git python python-pip nodejs npm mongodb supervisor nginx
            ;;
        *)
            echo -e "${RED}❌ Unsupported distribution: $DISTRO${NC}"
            echo -e "${YELLOW}💡 Please install manually: Python3, Node.js, MongoDB, Supervisor, Nginx${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}✅ System dependencies installed${NC}"
}

# Install Node.js dependencies
install_node_deps() {
    echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
    
    # Install yarn globally
    sudo npm install -g yarn
    
    # Install frontend dependencies
    cd frontend
    yarn install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    cd ..
}

# Setup Python environment
setup_python_env() {
    echo -e "${BLUE}🐍 Setting up Python environment...${NC}"
    
    # Create virtual environment
    python3 -m venv venv
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install Python dependencies
    cd backend
    pip install -r requirements.txt
    echo -e "${GREEN}✅ Python environment setup complete${NC}"
    cd ..
}

# Setup MongoDB
setup_mongodb() {
    echo -e "${BLUE}🍃 Setting up MongoDB...${NC}"
    
    # Start MongoDB service
    case $DISTRO in
        ubuntu|debian)
            sudo systemctl start mongod
            sudo systemctl enable mongod
            ;;
        fedora|rhel|centos)
            sudo systemctl start mongod
            sudo systemctl enable mongod
            ;;
        arch|manjaro)
            sudo systemctl start mongodb
            sudo systemctl enable mongodb
            ;;
    esac
    
    # Wait for MongoDB to start
    sleep 5
    
    # Test MongoDB connection
    if mongosh --eval "db.adminCommand('ismaster')" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MongoDB is running${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB might not be running. Please check manually.${NC}"
    fi
}

# Create environment files
create_env_files() {
    echo -e "${BLUE}⚙️  Creating environment files...${NC}"
    
    # Backend .env
    cat > backend/.env << EOF
MONGO_URL=mongodb://localhost:27017
DATABASE_NAME=trade_journal
JWT_SECRET_KEY=$(openssl rand -hex 32)
DEBUG=True
EOF
    
    # Frontend .env
    cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_APP_NAME=TradeJournal
EOF
    
    echo -e "${GREEN}✅ Environment files created${NC}"
}

# Setup Supervisor configuration
setup_supervisor() {
    echo -e "${BLUE}👮 Setting up Supervisor...${NC}"
    
    # Create supervisor config directory if it doesn't exist
    sudo mkdir -p /etc/supervisor/conf.d
    
    # Backend supervisor config
    sudo tee /etc/supervisor/conf.d/tradejournalbackend.conf > /dev/null << EOF
[program:tradejournalbackend]
command=$(pwd)/venv/bin/python server.py
directory=$(pwd)/backend
user=$USER
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/tradejournalbackend.err.log
stdout_logfile=/var/log/supervisor/tradejournalbackend.out.log
environment=PATH="$(pwd)/venv/bin"
EOF

    # Frontend supervisor config
    sudo tee /etc/supervisor/conf.d/tradejournalfront.conf > /dev/null << EOF
[program:tradejournalfront]
command=$(which yarn) start
directory=$(pwd)/frontend
user=$USER
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/tradejournalfront.err.log
stdout_logfile=/var/log/supervisor/tradejournalfront.out.log
environment=PATH="$(which node):$(which yarn):$PATH"
EOF
    
    # Reload supervisor
    sudo supervisorctl reread
    sudo supervisorctl update
    
    echo -e "${GREEN}✅ Supervisor configuration completed${NC}"
}

# Create startup script
create_startup_script() {
    echo -e "${BLUE}🚀 Creating startup script...${NC}"
    
    cat > start_tradejournal.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting TradeJournal..."

# Activate Python environment
source venv/bin/activate

# Start services
sudo supervisorctl start tradejournalbackend
sudo supervisorctl start tradejournalfront

echo "✅ TradeJournal started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8001"
echo ""
echo "📊 To stop services: sudo supervisorctl stop all"
echo "📈 To check status: sudo supervisorctl status"
EOF
    
    chmod +x start_tradejournal.sh
    echo -e "${GREEN}✅ Startup script created: ./start_tradejournal.sh${NC}"
}

# Create stop script
create_stop_script() {
    cat > stop_tradejournal.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping TradeJournal..."

sudo supervisorctl stop tradejournalbackend
sudo supervisorctl stop tradejournalfront

echo "✅ TradeJournal stopped!"
EOF
    
    chmod +x stop_tradejournal.sh
    echo -e "${GREEN}✅ Stop script created: ./stop_tradejournal.sh${NC}"
}

# Main installation function
main() {
    echo -e "${YELLOW}Starting TradeJournal installation...${NC}"
    echo ""
    
    detect_distro
    
    echo -e "${BLUE}This script will install:${NC}"
    echo -e "  • System dependencies (Python3, Node.js, MongoDB, etc.)"
    echo -e "  • Python virtual environment and packages"
    echo -e "  • Node.js/Yarn and frontend packages"
    echo -e "  • MongoDB database setup"
    echo -e "  • Supervisor process management"
    echo -e "  • Startup/stop management scripts"
    echo ""
    
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}❌ Installation cancelled${NC}"
        exit 1
    fi
    
    echo ""
    install_system_deps
    setup_python_env
    install_node_deps
    setup_mongodb
    create_env_files
    setup_supervisor
    create_startup_script
    create_stop_script
    
    echo ""
    echo -e "${GREEN}🎉 TradeJournal installation completed successfully!${NC}"
    echo ""
    echo -e "${CYAN}📋 Next Steps:${NC}"
    echo -e "  1. Start the application: ${YELLOW}./start_tradejournal.sh${NC}"
    echo -e "  2. Open your browser: ${YELLOW}http://localhost:3000${NC}"
    echo -e "  3. Start logging your trades! 📈"
    echo ""
    echo -e "${BLUE}📚 Management Commands:${NC}"
    echo -e "  • Start: ${YELLOW}./start_tradejournal.sh${NC}"
    echo -e "  • Stop: ${YELLOW}./stop_tradejournal.sh${NC}"
    echo -e "  • Status: ${YELLOW}sudo supervisorctl status${NC}"
    echo -e "  • Logs: ${YELLOW}sudo tail -f /var/log/supervisor/tradejournal*.log${NC}"
    echo ""
    echo -e "${GREEN}✨ Happy Trading! ✨${NC}"
}

# Run main function
main "$@"