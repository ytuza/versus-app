from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser automatically'

    def handle(self, *args, **options):
        # Solo crear si no existe ya un superusuario
        if not User.objects.filter(is_superuser=True).exists():
            email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
            password = os.environ.get('ADMIN_PASSWORD', 'adminpassword123')
            first_name = os.environ.get('ADMIN_FIRST_NAME', 'Admin')
            last_name = os.environ.get('ADMIN_LAST_NAME', 'User')
            
            user = User.objects.create_superuser(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Superuser created successfully: {email}')
            )
        else:
            self.stdout.write(
                self.style.WARNING('⚠️ Superuser already exists')
            )
