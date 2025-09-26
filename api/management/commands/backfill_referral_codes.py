from django.core.management.base import BaseCommand
from api.models import UserProfile


class Command(BaseCommand):
    help = 'Genera códigos de referido (6 caracteres) para perfiles que no lo tengan.'

    def handle(self, *args, **options):
        missing = UserProfile.objects.filter(referral_code__isnull=True) | UserProfile.objects.filter(referral_code='')
        count = 0
        for profile in missing.select_related('user'):
            # El save() del modelo generará el código si falta
            profile.referral_code = None
            profile.save()
            count += 1
            self.stdout.write(self.style.SUCCESS(f"✅ Código generado para {profile.user.email}: {profile.referral_code}"))

        if count == 0:
            self.stdout.write(self.style.WARNING('No hay perfiles sin código de referido.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Completado: {count} códigos generados.'))



