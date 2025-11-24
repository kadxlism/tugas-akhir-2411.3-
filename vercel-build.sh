#!/bin/bash

echo "🚀 Starting Vercel Build Script"

# Install Frontend Dependencies
echo "📦 Installing Frontend Dependencies..."
cd frontend
npm install
cd ..

# Install Backend Dependencies
echo "🐘 Installing Backend Dependencies..."

# Setup PHP and Composer locally since they are missing in Vercel build env
mkdir -p build_tools
cd build_tools

# Download Static PHP if not present
if ! command -v php &> /dev/null; then
    echo "⬇️ Downloading Static PHP (8.3)..."
    # Using static-php-cli binary
    curl -L -o php.tar.gz https://github.com/crazywhalecc/static-php-cli/releases/download/1.3.2/php-8.3.13-cli-linux-x64.tar.gz
    tar -xzf php.tar.gz
    chmod +x php
    export PATH="$(pwd):$PATH"
    echo "✅ PHP installed: $(php -v | head -n 1)"
else
    echo "✅ PHP found: $(php -v | head -n 1)"
fi

# Download Composer if not present
if ! command -v composer &> /dev/null; then
    echo "⬇️ Downloading Composer..."
    curl -sS https://getcomposer.org/installer | php
    chmod +x composer.phar
    mv composer.phar composer
    export PATH="$(pwd):$PATH"
    echo "✅ Composer installed: $(composer --version)"
else
    echo "✅ Composer found: $(composer --version)"
fi

cd ..

# Run Composer Install
echo "📂 Running composer install in backend..."
cd backend
composer install --no-dev --prefer-dist --optimize-autoloader --ignore-platform-reqs
cd ..

echo "✅ Build Script Completed"
