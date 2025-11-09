#!/bin/bash
#
# Upload .env variables as GitHub Secrets to the current repository
# 
# Usage: ./upload-env-secrets.sh [ENV_FILE] [-f|--force]
#
# Examples:
#   ./upload-env-secrets.sh
#   ./upload-env-secrets.sh .env.production
#   ./upload-env-secrets.sh -f

set -e

ENV_FILE="${1:-.env}"
FORCE=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        -f|--force)
            FORCE=true
            shift
            ;;
        *)
            if [[ "$arg" != "-f" && "$arg" != "--force" ]]; then
                ENV_FILE="$arg"
            fi
            ;;
    esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ Error: GitHub CLI (gh) is not installed.${NC}"
    echo -e "${YELLOW}Please install it from: https://cli.github.com/${NC}"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Error: Not authenticated with GitHub CLI.${NC}"
    echo -e "${YELLOW}Run: gh auth login${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: $ENV_FILE file not found!${NC}"
    exit 1
fi

# Get current repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
if [ -z "$REPO" ]; then
    echo -e "${RED}❌ Error: Not in a git repository or no remote configured.${NC}"
    exit 1
fi

echo -e "${CYAN}📦 Repository: $REPO${NC}"

# Parse .env file
declare -A env_vars
line_number=0

while IFS= read -r line || [ -n "$line" ]; do
    ((line_number++))
    
    # Trim whitespace
    line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    
    # Skip empty lines and comments
    if [ -z "$line" ] || [[ "$line" =~ ^# ]]; then
        continue
    fi
    
    # Parse KEY=VALUE
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        # Trim whitespace from key and value
        key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        value=$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        
        # Remove quotes if present
        if [[ "$value" =~ ^\"(.*)\"$ ]] || [[ "$value" =~ ^\'(.*)\'$ ]]; then
            value="${BASH_REMATCH[1]}"
        fi
        
        env_vars["$key"]="$value"
    else
        echo -e "${YELLOW}⚠️  Warning: Line $line_number has invalid format: $line${NC}"
    fi
done < "$ENV_FILE"

if [ ${#env_vars[@]} -eq 0 ]; then
    echo -e "${RED}❌ No valid environment variables found in $ENV_FILE${NC}"
    exit 1
fi

echo -e "\n${GREEN}📋 Found ${#env_vars[@]} environment variables:${NC}"
for key in "${!env_vars[@]}"; do
    value="${env_vars[$key]}"
    value_len=${#value}
    
    if [ $value_len -gt 10 ]; then
        masked_value="${value:0:3}...${value: -3}"
    else
        masked_value="***"
    fi
    
    echo -e "${GRAY}  • $key = $masked_value${NC}"
done

# Confirm upload
if [ "$FORCE" != true ]; then
    echo -e "\n${YELLOW}⚠️  This will upload these secrets to: $REPO${NC}"
    read -p "Continue? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Cancelled by user.${NC}"
        exit 0
    fi
fi

# Upload secrets
echo -e "\n${CYAN}🚀 Uploading secrets...${NC}"
success_count=0
fail_count=0

for key in "${!env_vars[@]}"; do
    value="${env_vars[$key]}"
    
    if echo "$value" | gh secret set "$key" --repo "$REPO" 2>/dev/null; then
        echo -e "${GREEN}  ✓ $key${NC}"
        ((success_count++))
    else
        echo -e "${RED}  ✗ $key (failed)${NC}"
        ((fail_count++))
    fi
done

# Summary
echo -e "\n${CYAN}==================================================${NC}"
echo -e "${CYAN}📊 Summary:${NC}"
echo -e "${GREEN}  ✓ Success: $success_count${NC}"
if [ $fail_count -gt 0 ]; then
    echo -e "${RED}  ✗ Failed:  $fail_count${NC}"
fi
echo -e "${CYAN}==================================================${NC}"

if [ $fail_count -eq 0 ]; then
    echo -e "\n${GREEN}✅ All secrets uploaded successfully!${NC}"
    echo -e "\n${YELLOW}📝 Note: You still need to manually add:${NC}"
    echo -e "${YELLOW}  • SERVER_IP      (your Ubuntu server IP address)${NC}"
    echo -e "${YELLOW}  • SSH_PRIVATE_KEY (your private SSH key for deployment)${NC}"
    echo -e "\n${GRAY}Add them with:${NC}"
    echo -e "${GRAY}  gh secret set SERVER_IP --repo $REPO${NC}"
    echo -e "${GRAY}  gh secret set SSH_PRIVATE_KEY --repo $REPO < ~/.ssh/id_ed25519${NC}"
else
    echo -e "\n${RED}⚠️  Some secrets failed to upload. Please check the errors above.${NC}"
    exit 1
fi
