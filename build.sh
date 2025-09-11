#!/usr/bin/env bash
# exit on error
set -o errexit

# Establecer variable de entorno para indicar que estamos en Render
export RENDER=1

echo "🔧 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "📁 Collecting static files..."
python manage.py collectstatic --no-input

echo "🗄️ Running migrations..."
python manage.py migrate

echo "👤 Creating admin user..."
python manage.py create_admin

echo "✅ Build completed successfully!"
