from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.utils import timezone
import random

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar_url = models.URLField(blank=True, null=True)
    coins = models.PositiveIntegerField(default=0)  # Campo para los coins del usuario
    is_influencer = models.BooleanField(default=False)  # Rol de influencer
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - Profile ({self.coins} coins, Influencer: {self.is_influencer})"

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    amount = models.PositiveIntegerField(help_text='Cantidad de coins a comprar')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Precio total en soles')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_image = models.ImageField(upload_to='payment_proofs/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='approved_transactions',
        help_text='Admin que aprobó/rechazó la transacción'
    )
    admin_notes = models.TextField(blank=True, help_text='Notas del admin sobre la transacción')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.amount} coins - {self.status}"

    def save(self, *args, **kwargs):
        # Calcular automáticamente el precio total (2 soles por coin)
        if not self.total_price:
            self.total_price = self.amount * 2
        super().save(*args, **kwargs)

class Battle(models.Model):
    STATUS_CHOICES = [
        ('active', 'Activa'),
        ('finished', 'Terminada'),
        ('cancelled', 'Cancelada'),
    ]
    
    influencer_a = models.ForeignKey(User, on_delete=models.CASCADE, related_name='battles_as_a')
    influencer_b = models.ForeignKey(User, on_delete=models.CASCADE, related_name='battles_as_b')
    title = models.CharField(max_length=200, help_text='Título de la batalla')
    description = models.TextField(blank=True, help_text='Descripción de la batalla')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(help_text='Cuándo termina la batalla')
    duration_minutes = models.PositiveIntegerField(help_text='Duración en minutos')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    total_coins_a = models.PositiveIntegerField(default=0, help_text='Total de coins apostados al influencer A')
    total_coins_b = models.PositiveIntegerField(default=0, help_text='Total de coins apostados al influencer B')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='battles_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.influencer_a.email} vs {self.influencer_b.email}"

    def save(self, *args, **kwargs):
        # Calcular end_time automáticamente si no está establecido
        if not self.end_time and self.duration_minutes:
            self.end_time = timezone.now() + timezone.timedelta(minutes=self.duration_minutes)
        super().save(*args, **kwargs)

    @property
    def total_coins(self):
        """Total de coins apostados en la batalla"""
        return self.total_coins_a + self.total_coins_b

    @property
    def is_active(self):
        """Verificar si la batalla está activa y no ha terminado"""
        return self.status == 'active' and self.end_time > timezone.now()

    @property
    def time_remaining(self):
        """Tiempo restante en segundos"""
        if self.status != 'active':
            return 0
        remaining = self.end_time - timezone.now()
        return max(0, int(remaining.total_seconds()))

    def get_winner(self):
        """Obtener el influencer ganador"""
        if self.status != 'finished':
            return None
        if self.total_coins_a > self.total_coins_b:
            return self.influencer_a
        elif self.total_coins_b > self.total_coins_a:
            return self.influencer_b
        else:
            return None  # Empate

    def calculate_results(self):
        """Calcular resultados de la batalla"""
        if self.status != 'finished':
            return None
        
        total_coins = self.total_coins
        if total_coins == 0:
            return None
        
        winner = self.get_winner()
        if not winner:
            return None  # Empate
        
        # Calcular distribución 25/25/25/25
        platform_profit = total_coins * 25 // 100  # 25% para plataforma
        winner_profit = total_coins * 25 // 100    # 25% para influencer ganador
        
        # 25% para sorteo (se mantiene igual)
        sorteo_profit = total_coins * 25 // 100
        
        # 25% comisión proporcional
        commission_profit = total_coins * 25 // 100
        total_a = self.total_coins_a
        total_b = self.total_coins_b
        
        commission_a = (commission_profit * total_a) // total_coins if total_coins > 0 else 0
        commission_b = (commission_profit * total_b) // total_coins if total_coins > 0 else 0
        
        return {
            'winner': winner,
            'platform_profit': platform_profit,
            'winner_profit': winner_profit,
            'sorteo_profit': sorteo_profit,
            'commission_a': commission_a,
            'commission_b': commission_b,
            'total_coins': total_coins
        }

class BattleBet(models.Model):
    INFLUENCER_CHOICES = [
        ('a', 'Influencer A'),
        ('b', 'Influencer B'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='battle_bets')
    battle = models.ForeignKey('Battle', on_delete=models.CASCADE, related_name='bets')
    influencer_choice = models.CharField(max_length=1, choices=INFLUENCER_CHOICES, help_text='Influencer elegido')
    coins_amount = models.PositiveIntegerField(help_text='Cantidad de coins apostados')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'battle']  # Un usuario solo puede apostar una vez por batalla

    def __str__(self):
        return f"{self.user.email} - {self.coins_amount} coins en {self.battle.title}"

    def save(self, *args, **kwargs):
        # Verificar que el usuario tenga suficientes coins
        if self.user.profile.coins < self.coins_amount:
            raise ValueError('No tienes suficientes coins')
        
        # Descontar coins del usuario
        self.user.profile.coins -= self.coins_amount
        self.user.profile.save()
        
        # Actualizar total de coins en la batalla
        if self.influencer_choice == 'a':
            self.battle.total_coins_a += self.coins_amount
        else:
            self.battle.total_coins_b += self.coins_amount
        self.battle.save()
        
        super().save(*args, **kwargs)

class BattleResult(models.Model):
    battle = models.OneToOneField('Battle', on_delete=models.CASCADE, related_name='result')
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='battles_won')
    platform_profit = models.PositiveIntegerField(help_text='Coins para la plataforma')
    winner_profit = models.PositiveIntegerField(help_text='Coins para el influencer ganador')
    sorteo_profit = models.PositiveIntegerField(help_text='Coins para el sorteo')
    commission_a = models.PositiveIntegerField(help_text='Comisión para influencer A')
    commission_b = models.PositiveIntegerField(help_text='Comisión para influencer B')
    sorteo_winner = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='sorteo_wins',
        help_text='Ganador del sorteo'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resultado de {self.battle.title} - Ganador: {self.winner.email}"

    @classmethod
    def create_from_battle(cls, battle):
        """Crear resultado de batalla y hacer sorteo automático"""
        results = battle.calculate_results()
        if not results:
            return None
        
        # Hacer sorteo automático
        winning_team_bets = battle.bets.filter(
            influencer_choice='a' if results['winner'] == battle.influencer_a else 'b'
        )
        
        sorteo_winner = None
        if winning_team_bets.exists():
            # Crear lista ponderada por coins
            weighted_users = []
            for bet in winning_team_bets:
                weighted_users.extend([bet.user] * bet.coins_amount)
            
            if weighted_users:
                sorteo_winner = random.choice(weighted_users)
        
        return cls.objects.create(
            battle=battle,
            winner=results['winner'],
            platform_profit=results['platform_profit'],
            winner_profit=results['winner_profit'],
            sorteo_profit=results['sorteo_profit'],
            commission_a=results['commission_a'],
            commission_b=results['commission_b'],
            sorteo_winner=sorteo_winner
        )

class Raffle(models.Model):
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('completed', 'Completado'),
        ('processed', 'Procesado'),
    ]
    
    title = models.CharField(max_length=200, help_text='Título del sorteo')
    description = models.TextField(help_text='Descripción del sorteo')
    target_amount = models.PositiveIntegerField(help_text='Monto objetivo en coins')
    current_amount = models.PositiveIntegerField(default=0, help_text='Monto actual recaudado')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='raffles_created')
    winner = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='raffles_won',
        help_text='Ganador del sorteo'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True, help_text='Cuándo se procesó el sorteo')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.current_amount}/{self.target_amount} coins"

    @property
    def is_completed(self):
        """Verificar si el sorteo ha alcanzado el monto objetivo"""
        return self.current_amount >= self.target_amount

    @property
    def progress_percentage(self):
        """Porcentaje de progreso del sorteo"""
        if self.target_amount == 0:
            return 0
        return min(100, (self.current_amount * 100) // self.target_amount)

    @property
    def total_participations(self):
        """Total de participaciones en el sorteo"""
        return self.participations.count()

    def select_winner(self):
        """Seleccionar ganador basado en probabilidades proporcionales"""
        if self.status != 'completed':
            return None
        
        participations = self.participations.all()
        if not participations.exists():
            return None
        
        # Crear lista ponderada por coins
        weighted_users = []
        for participation in participations:
            weighted_users.extend([participation.user] * participation.coins_amount)
        
        if weighted_users:
            winner = random.choice(weighted_users)
            self.winner = winner
            self.status = 'processed'
            self.processed_at = timezone.now()
            self.save()
            
            # Dar los coins al ganador
            winner.profile.coins += self.current_amount
            winner.profile.save()
            
            return winner
        return None

class RaffleParticipation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='raffle_participations')
    raffle = models.ForeignKey('Raffle', on_delete=models.CASCADE, related_name='participations')
    coins_amount = models.PositiveIntegerField(help_text='Cantidad de coins participando')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'raffle']  # Un usuario solo puede participar una vez por sorteo

    def __str__(self):
        return f"{self.user.email} - {self.coins_amount} coins en {self.raffle.title}"

    def save(self, *args, **kwargs):
        # Verificar que el usuario tenga suficientes coins
        if self.user.profile.coins < self.coins_amount:
            raise ValueError('No tienes suficientes coins')
        
        # Descontar coins del usuario
        self.user.profile.coins -= self.coins_amount
        self.user.profile.save()
        
        # Actualizar monto actual del sorteo
        self.raffle.current_amount += self.coins_amount
        
        # Verificar si el sorteo se completó
        if self.raffle.current_amount >= self.raffle.target_amount and self.raffle.status == 'active':
            self.raffle.status = 'completed'
        
        self.raffle.save()
        
        super().save(*args, **kwargs)
