#!/usr/bin/env python
"""
Script para resetear la contraseña del superusuario de Django
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

def reset_admin_password():
    User = get_user_model()
    
    # Buscar el primer superusuario
    admin_user = User.objects.filter(is_superuser=True).first()
    
    if admin_user:
        print(f"📧 Superusuario encontrado: {admin_user.email}")
        print(f"👤 Nombre: {admin_user.first_name} {admin_user.last_name}")
        
        # Nueva contraseña
        nueva_password = "admin123456"
        
        # Cambiar la contraseña
        admin_user.set_password(nueva_password)
        admin_user.save()
        
        print("✅ ¡Contraseña actualizada exitosamente!")
        print(f"📧 Email: {admin_user.email}")
        print(f"🔑 Nueva contraseña: {nueva_password}")
        print("\nYa puedes acceder al admin de Django con estas credenciales.")
        print("URL del admin: http://localhost:8000/admin/")
        
    else:
        print("❌ No se encontró ningún superusuario en la base de datos.")
        print("Ejecuta: python manage.py createsuperuser")

if __name__ == "__main__":
    reset_admin_password()
