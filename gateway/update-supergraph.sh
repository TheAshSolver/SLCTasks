#!/bin/bash

set -e  # Exit on any error

# Configuration
ROVER_VERSION="v2.9.3"
COMPOSER_DIR="composer"
TEMP_DIR="rover_temp"
DOWNLOAD_URL="https://rover.apollo.dev/tar/supergraph/x86_64-unknown-linux-gnu/${ROVER_VERSION}"
OUTPUT_FILE="supergraph-${ROVER_VERSION}-bin.tar.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_info_end() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required commands are available
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed. Please install curl."
        exit 1
    fi
    
    if ! command -v tar &> /dev/null; then
        log_error "tar is required but not installed. Please install tar."
        exit 1
    fi
    
    log_info "Dependencies check passed"
}

# Create necessary directories
setup_directories() {
    log_info "Setting up directories..."
    
    # Create composer directory if it doesn't exist
    if [ ! -d "$COMPOSER_DIR" ]; then
        mkdir -p "$COMPOSER_DIR"
        log_info "Created $COMPOSER_DIR directory"
    fi
    
    # Create temporary directory
    if [ -d "$TEMP_DIR" ]; then
        log_warn "Temporary directory $TEMP_DIR already exists. Removing..."
        rm -rf "$TEMP_DIR"
    fi
    mkdir -p "$TEMP_DIR"
    log_info "Created temporary directory $TEMP_DIR"
}

# Download rover binary
download_rover() {
    log_info "Downloading Rover $ROVER_VERSION from Apollo..."
    
    if curl -fsSL "$DOWNLOAD_URL" -o "$TEMP_DIR/rover.tar.gz"; then
        log_info "Downloaded rover binary successfully"
    else
        log_error "Failed to download rover binary from $DOWNLOAD_URL"
        cleanup
        exit 1
    fi
}

# Extract the downloaded archive
extract_rover() {
    log_info "Extracting rover binary..."
    
    cd "$TEMP_DIR"
    if tar -xzf rover.tar.gz; then
        log_info "Extracted rover binary successfully"
    else
        log_error "Failed to extract rover binary"
        cd ..
        cleanup
        exit 1
    fi
    cd ..
}

# Verify the supergraph binary exists
verify_binary() {
    log_info "Verifying supergraph binary..."
    
    if [ -f "$TEMP_DIR/dist/supergraph" ]; then
        log_info "Found supergraph binary at $TEMP_DIR/dist/supergraph"
        
        # Make it executable and test it
        chmod +x "$TEMP_DIR/dist/supergraph"
        
        # Try to get version info
        if "$TEMP_DIR/dist/supergraph" --version &> /dev/null; then
            VERSION_OUTPUT=$("$TEMP_DIR/dist/supergraph" --version 2>&1 || true)
            log_info "Supergraph binary version: $VERSION_OUTPUT"
        else
            log_warn "Could not get version info from supergraph binary, but file exists"
        fi
    else
        log_error "Supergraph binary not found in expected location: $TEMP_DIR/dist/supergraph"
        cleanup
        exit 1
    fi
}

# Create the new tar.gz package
repackage_binary() {
    log_info "Repackaging supergraph binary as $OUTPUT_FILE..."
    
    cd "$TEMP_DIR"
    # Create a version-named copy of the binary
    cp dist/supergraph "supergraph-${ROVER_VERSION}" || {
        log_error "Failed to create versioned supergraph binary"
        cd ..
        cleanup
        exit 1
    }
    
    if tar -czf "../$COMPOSER_DIR/$OUTPUT_FILE" "supergraph-${ROVER_VERSION}"; then
        log_info "Successfully created $COMPOSER_DIR/$OUTPUT_FILE"
    else
        log_error "Failed to create tar.gz package"
        cd ..
        cleanup
        exit 1
    fi
    cd ..
    
    # Remove the downloaded tar file after successful repackaging
    remove_downloaded_tar
}

# Clean up temporary files
cleanup() {
    log_info "Cleaning up temporary files..."
    
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
        log_info "Removed temporary directory $TEMP_DIR"
    fi
}

# Remove old rover binary if it exists
remove_old_binary() {
    OLD_PATTERN="$COMPOSER_DIR/supergraph-v*-bin.tar.gz"
    
    # Find old rover binaries
    OLD_FILES=($(ls $OLD_PATTERN 2>/dev/null || true))
    
    if [ ${#OLD_FILES[@]} -gt 0 ]; then
        log_warn "Found existing rover binary files:"
        for file in "${OLD_FILES[@]}"; do
            echo "  - $file"
        done
        
        read -p "Do you want to remove old rover binaries? (y/N): " -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for file in "${OLD_FILES[@]}"; do
                rm -f "$file"
                log_info "Removed $file"
            done
        else
            log_info "Keeping old rover binaries"
        fi
    fi
}

# Remove the downloaded temporary tar file
remove_downloaded_tar() {
    log_info "Removing downloaded tar file..."
    
    if [ -f "$TEMP_DIR/rover.tar.gz" ]; then
        rm -f "$TEMP_DIR/rover.tar.gz"
        log_info "Removed downloaded tar file"
    fi
}

# Update supergraph.yml with new federation version
update_supergraph_yml() {
    local supergraph_yml_path="$COMPOSER_DIR/supergraph.yml"
    local federation_version="2.9.3"
    
    log_info "Updating supergraph.yml with new federation version..."
    
    if [ ! -f "$supergraph_yml_path" ]; then
        log_warn "supergraph.yml not found at $supergraph_yml_path. Skipping supergraph.yml update."
        return
    fi
    
    # Create backup of original supergraph.yml
    cp "$supergraph_yml_path" "${supergraph_yml_path}.backup"
    log_info "Created backup: ${supergraph_yml_path}.backup"
    
    # Update the federation_version line
    sed -i.tmp \
        -e "s|federation_version: =.*|federation_version: =${federation_version}|g" \
        "$supergraph_yml_path"
    
    # Remove the temporary file created by sed
    rm -f "${supergraph_yml_path}.tmp"
    
    # Verify the changes were made
    if grep -q "federation_version: =${federation_version}" "$supergraph_yml_path"; then
        log_info "Successfully updated supergraph.yml with federation version: ${federation_version}"
    else
        log_error "Failed to update supergraph.yml. Restoring backup."
        mv "${supergraph_yml_path}.backup" "$supergraph_yml_path"
        return 1
    fi
    
    # Show the updated line
    log_info "Updated federation_version in supergraph.yml:"
    grep -n "federation_version" "$supergraph_yml_path" | sed 's/^/  /'
}

# Update Dockerfile with new tar file path
update_dockerfile() {
    local dockerfile_path="Dockerfile"
    
    log_info "Updating Dockerfile with new tar file path..."
    
    if [ ! -f "$dockerfile_path" ]; then
        log_warn "Dockerfile not found at $dockerfile_path. Skipping Dockerfile update."
        return
    fi
    
    # Create backup of original Dockerfile
    cp "$dockerfile_path" "${dockerfile_path}.backup"
    log_info "Created backup: ${dockerfile_path}.backup"
    
    # Update the tar extraction line and comment
    sed -i.tmp \
        -e "s|RUN tar -xvf ./composer/supergraph-v.*-bin\.tar\.gz|RUN tar -xvf ./composer/${OUTPUT_FILE}|g" \
        "$dockerfile_path"
    
    # Remove the temporary file created by sed
    rm -f "${dockerfile_path}.tmp"
    
    # Verify the changes were made
    if grep -q "$OUTPUT_FILE" "$dockerfile_path"; then
        log_info "Successfully updated Dockerfile with new tar file: $OUTPUT_FILE"
    else
        log_error "Failed to update Dockerfile. Restoring backup."
        mv "${dockerfile_path}.backup" "$dockerfile_path"
        return 1
    fi
    
    # Show the updated lines
    log_info "Updated lines in Dockerfile:"
    grep -n -A1 -B1 "$OUTPUT_FILE" "$dockerfile_path" | sed 's/^/  /'
}

# Main execution
main() {
    log_info_end "Starting Rover $ROVER_VERSION update process..."
    
    check_dependencies
    setup_directories
    remove_old_binary
    download_rover
    extract_rover
    verify_binary
    repackage_binary
    update_dockerfile
    update_supergraph_yml
    cleanup
    
    log_info_end "Successfully updated Rover to $ROVER_VERSION!"
    log_info_end "New binary package: $COMPOSER_DIR/$OUTPUT_FILE"
    log_info_end ""
    log_info_end "Next steps:"
    log_info_end "1. Update the npm packages in your project, if required"
    log_info_end "2. Rebuild your Docker image"
    log_info_end "3. Test the updated setup"
    log_info_end ""
    log_info_end "Note: Backups have been created:"
    log_info_end "  - Dockerfile.backup"
    log_info_end "  - $COMPOSER_DIR/supergraph.yml.backup"
}

# Trap to ensure cleanup on script exit
trap cleanup EXIT

# Run main function
main "$@"