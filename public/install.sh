#!/bin/bash
# oddJobs Campus CLI - One-line installer
# Works on: macOS, Linux, Windows (WSL/Git Bash)

set -e

CLI_URL="https://oddjobs.joalvergs.tech/oddjobs-cli.js"
INSTALL_DIR="$HOME/.oddjobs"
BIN_DIR="$HOME/.local/bin"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}  ██████╗ ██████╗ ██████╗      ██╗ ██████╗ ██████╗ ███████╗${NC}"
echo -e "${YELLOW} ██╔═══██╗██╔══██╗██╔══██╗     ██║██╔═══██╗██╔══██╗██╔════╝${NC}"
echo -e "${YELLOW} ██║   ██║██║  ██║██║  ██║     ██║██║   ██║██████╔╝███████╗${NC}"
echo -e "${YELLOW} ██║   ██║██║  ██║██║  ██║██   ██║██║   ██║██╔══██╗╚════██║${NC}"
echo -e "${YELLOW} ╚██████╔╝██████╔╝██████╔╝╚█████╔╝╚██████╔╝██████╔╝███████║${NC}"
echo -e "${YELLOW}  ╚═════╝ ╚═════╝ ╚═════╝  ╚════╝  ╚═════╝ ╚═════╝ ╚══════╝${NC}"
echo ""
echo "  MSU-IIT Student Workforce Marketplace CLI"
echo ""

# Detect OS
OS="$(uname -s)"
case "$OS" in
  Darwin*)  PLATFORM="macos" ;;
  Linux*)   PLATFORM="linux" ;;
  MINGW*|MSYS*|CYGWIN*) PLATFORM="windows" ;;
  *)        PLATFORM="unknown" ;;
esac

echo "  Platform detected: $PLATFORM"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}  ✗ Node.js not found${NC}"
  echo ""
  echo "  Please install Node.js first:"
  echo "  • macOS:   brew install node"
  echo "  • Linux:   sudo apt install nodejs npm"
  echo "  • Windows: https://nodejs.org"
  echo ""
  exit 1
fi

echo -e "${GREEN}  ✓ Node.js found: $(node --version)${NC}"
echo ""

# Install the CLI
echo "  Installing oddjobs-cli..."
echo ""

mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"

# Download the CLI script directly
if curl -fsSL "$CLI_URL" -o "$INSTALL_DIR/oddjobs-cli.js"; then
  chmod +x "$INSTALL_DIR/oddjobs-cli.js"
  
  # Create wrapper script
  cat > "$BIN_DIR/oddjobs-cli" << 'EOF'
#!/bin/bash
node "$HOME/.oddjobs/oddjobs-cli.js" "$@"
EOF
  chmod +x "$BIN_DIR/oddjobs-cli"
  
  # Add to PATH if needed
  if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc" 2>/dev/null || true
    echo -e "${YELLOW}  ⚠ Please restart your terminal or run: source ~/.bashrc${NC}"
  fi
  
  echo -e "${GREEN}  ✓ Installation successful!${NC}"
else
  echo -e "${RED}  ✗ Download failed. Please check your internet connection.${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}  ═══ Installation Complete ═══${NC}"
echo ""
echo "  Quick start:"
echo "    oddjobs-cli          # Start interactive mode"
echo "    oddjobs-cli help     # Show all commands"
echo "    oddjobs-cli browse   # Browse jobs"
echo ""
echo "  Documentation: https://oddjobs.joalvergs.tech"
echo ""
