#!/bin/bash
set -e
echo "Installing dependencies..."
pnpm install
echo "Building application..."
pnpm build
echo "Build completed successfully!"
