from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Battle, BattleResult
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Procesa batallas que han terminado y calcula resultados'

    def handle(self, *args, **options):
        self.stdout.write('Procesando batallas terminadas...')
        
        # Obtener batallas activas que han terminado
        now = timezone.now()
        finished_battles = Battle.objects.filter(
            status='active',
            end_time__lte=now
        )
        
        processed_count = 0
        
        for battle in finished_battles:
            try:
                self.stdout.write(f'Procesando batalla: {battle.title} (ID: {battle.id})')
                
                # Cambiar estado a finished
                battle.status = 'finished'
                battle.save()
                
                # Calcular resultados
                results = battle.calculate_results()
                if results:
                    # Crear resultado de batalla con sorteo automático
                    battle_result = BattleResult.create_from_battle(battle)
                    
                    if battle_result:
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'✅ Batalla {battle.title} procesada exitosamente. '
                                f'Ganador: {battle_result.winner.get_full_name()}'
                            )
                        )
                        
                        # Mostrar información del sorteo si hay ganador
                        if battle_result.sorteo_winner:
                            self.stdout.write(
                                f'🎉 Ganador del sorteo: {battle_result.sorteo_winner.get_full_name()} '
                                f'({battle_result.sorteo_winner.email})'
                            )
                        
                        processed_count += 1
                    else:
                        self.stdout.write(
                            self.style.WARNING(
                                f'⚠️ No se pudo crear resultado para la batalla {battle.title}'
                            )
                        )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'⚠️ No se pudieron calcular resultados para la batalla {battle.title}'
                        )
                    )
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'❌ Error procesando batalla {battle.title}: {str(e)}'
                    )
                )
                logger.error(f'Error procesando batalla {battle.id}: {str(e)}')
        
        if processed_count > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Procesamiento completado. {processed_count} batallas procesadas.'
                )
            )
        else:
            self.stdout.write('ℹ️ No hay batallas pendientes de procesar.')
