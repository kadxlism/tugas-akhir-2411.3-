#!/bin/bash

echo "🚀 Starting Vercel Build Script"

# Install Frontend Dependencies
echo "📦 Installing Frontend Dependencies..."
cd frontend
npm install
cd ..

# Install Backend Dependencies
echo "🐘 Installing Backend Dependencies..."
cd backend
# Check if composer is available
if ! command -v composer &> /dev/null; then
    echo "❌ Composer could not be found. Attempting to download..."
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
fi

composer install --no-dev --prefer-dist --optimize-autoloader --ignore-platform-reqs
cd ..

echo "✅ Build Script Completed"
