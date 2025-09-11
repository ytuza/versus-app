from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile, Transaction, Battle, BattleBet, BattleResult, Raffle, RaffleParticipation

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'confirm_password']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Las contraseñas no coinciden'})
        
        # Validar que el email no esté en uso
        email = attrs.get('email')
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'Este correo electrónico ya está registrado'})
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email:
            raise serializers.ValidationError({'email': 'El correo electrónico es requerido'})
        
        if not password:
            raise serializers.ValidationError({'password': 'La contraseña es requerida'})

        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError({'non_field_errors': 'Credenciales inválidas. Verifica tu correo y contraseña.'})
            if not user.is_active:
                raise serializers.ValidationError({'non_field_errors': 'Tu cuenta está desactivada. Contacta al administrador.'})
            attrs['user'] = user
        
        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'first_name', 'last_name', 'avatar_url', 'coins', 'is_staff', 'is_influencer', 'created_at']

class TransactionSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    approved_by_email = serializers.EmailField(source='approved_by.email', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_email', 'user_name', 'amount', 'total_price', 
            'status', 'payment_image', 'created_at', 'updated_at', 
            'approved_by', 'approved_by_email', 'admin_notes'
        ]
        read_only_fields = ['total_price', 'status', 'approved_by', 'approved_by_email', 'admin_notes']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        if value > 1000:  # Límite máximo de coins por transacción
            raise serializers.ValidationError("No puedes comprar más de 1000 coins por transacción")
        return value

class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['amount', 'payment_image']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        if value > 1000:
            raise serializers.ValidationError("No puedes comprar más de 1000 coins por transacción")
        return value

class TransactionAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    approved_by_email = serializers.EmailField(source='approved_by.email', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_email', 'user_name', 'amount', 'total_price', 
            'status', 'payment_image', 'created_at', 'updated_at', 
            'approved_by', 'approved_by_email', 'admin_notes'
        ]
        read_only_fields = ['user', 'user_email', 'user_name', 'amount', 'total_price', 
                           'payment_image', 'created_at', 'updated_at', 'approved_by_email']

class UserCoinsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['coins']

class BattleSerializer(serializers.ModelSerializer):
    influencer_a_name = serializers.CharField(source='influencer_a.get_full_name', read_only=True)
    influencer_a_email = serializers.EmailField(source='influencer_a.email', read_only=True)
    influencer_b_name = serializers.CharField(source='influencer_b.get_full_name', read_only=True)
    influencer_b_email = serializers.EmailField(source='influencer_b.email', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    time_remaining = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    total_coins = serializers.IntegerField(read_only=True)

    class Meta:
        model = Battle
        fields = [
            'id', 'title', 'description', 'influencer_a', 'influencer_a_name', 'influencer_a_email',
            'influencer_b', 'influencer_b_name', 'influencer_b_email', 'start_time', 'end_time',
            'duration_minutes', 'status', 'total_coins_a', 'total_coins_b', 'total_coins',
            'created_by', 'created_by_name', 'created_at', 'updated_at', 'time_remaining', 'is_active'
        ]
        read_only_fields = ['start_time', 'total_coins_a', 'total_coins_b', 'created_by', 'created_at', 'updated_at']

class BattleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Battle
        fields = ['influencer_a', 'influencer_b', 'title', 'description', 'duration_minutes']

    def validate(self, attrs):
        influencer_a = attrs.get('influencer_a')
        influencer_b = attrs.get('influencer_b')
        
        if influencer_a == influencer_b:
            raise serializers.ValidationError("Los influencers deben ser diferentes")
        
        # Verificar que ambos sean influencers
        if not influencer_a.profile.is_influencer:
            raise serializers.ValidationError("El primer usuario debe ser un influencer")
        
        if not influencer_b.profile.is_influencer:
            raise serializers.ValidationError("El segundo usuario debe ser un influencer")
        
        return attrs

class BattleBetSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    battle_title = serializers.CharField(source='battle.title', read_only=True)

    class Meta:
        model = BattleBet
        fields = [
            'id', 'user', 'user_name', 'user_email', 'battle', 'battle_title',
            'influencer_choice', 'coins_amount', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

class BattleBetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BattleBet
        fields = ['battle', 'influencer_choice', 'coins_amount']

    def validate(self, attrs):
        battle = attrs.get('battle')
        coins_amount = attrs.get('coins_amount')
        user = self.context['request'].user
        
        # Verificar que la batalla esté activa
        if battle.status != 'active':
            raise serializers.ValidationError("La batalla no está activa")
        
        # Verificar que no haya terminado
        if not battle.is_active:
            raise serializers.ValidationError("La batalla ya ha terminado")
        
        # Verificar que el usuario tenga suficientes coins
        if user.profile.coins < coins_amount:
            raise serializers.ValidationError("No tienes suficientes coins")
        
        # Verificar que no haya apostado antes
        if BattleBet.objects.filter(user=user, battle=battle).exists():
            raise serializers.ValidationError("Ya has apostado en esta batalla")
        
        return attrs

class BattleResultSerializer(serializers.ModelSerializer):
    battle_title = serializers.CharField(source='battle.title', read_only=True)
    winner_name = serializers.CharField(source='winner.get_full_name', read_only=True)
    winner_email = serializers.EmailField(source='winner.email', read_only=True)
    sorteo_winner_name = serializers.CharField(source='sorteo_winner.get_full_name', read_only=True)
    sorteo_winner_email = serializers.EmailField(source='sorteo_winner.email', read_only=True)
    battle = BattleSerializer(read_only=True)

    class Meta:
        model = BattleResult
        fields = [
            'id', 'battle', 'battle_title', 'winner', 'winner_name', 'winner_email',
            'platform_profit', 'winner_profit', 'sorteo_profit', 'commission_a', 'commission_b',
            'sorteo_winner', 'sorteo_winner_name', 'sorteo_winner_email', 'created_at'
        ]
        read_only_fields = ['created_at']

class RaffleSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    winner_name = serializers.CharField(source='winner.get_full_name', read_only=True)
    winner_email = serializers.EmailField(source='winner.email', read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    total_participations = serializers.IntegerField(read_only=True)
    is_completed = serializers.BooleanField(read_only=True)

    class Meta:
        model = Raffle
        fields = [
            'id', 'title', 'description', 'target_amount', 'current_amount',
            'status', 'created_by', 'created_by_name', 'winner', 'winner_name', 'winner_email',
            'created_at', 'updated_at', 'processed_at', 'progress_percentage', 
            'total_participations', 'is_completed'
        ]
        read_only_fields = ['current_amount', 'status', 'created_by', 'winner', 'created_at', 'updated_at', 'processed_at']

class RaffleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Raffle
        fields = ['title', 'description', 'target_amount']

    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto objetivo debe ser mayor a 0")
        if value > 100000:  # Límite máximo de coins por sorteo
            raise serializers.ValidationError("El monto objetivo no puede ser mayor a 100,000 coins")
        return value

class RaffleParticipationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    raffle_title = serializers.CharField(source='raffle.title', read_only=True)

    class Meta:
        model = RaffleParticipation
        fields = [
            'id', 'user', 'user_name', 'user_email', 'raffle', 'raffle_title',
            'coins_amount', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

class RaffleParticipationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RaffleParticipation
        fields = ['raffle', 'coins_amount']

    def validate(self, attrs):
        raffle = attrs.get('raffle')
        coins_amount = attrs.get('coins_amount')
        user = self.context['request'].user
        
        # Verificar que el sorteo esté activo
        if raffle.status != 'active':
            raise serializers.ValidationError("El sorteo no está activo")
        
        # Verificar que el sorteo no esté completado
        if raffle.is_completed:
            raise serializers.ValidationError("El sorteo ya ha alcanzado su objetivo")
        
        # Verificar que el usuario tenga suficientes coins
        if user.profile.coins < coins_amount:
            raise serializers.ValidationError("No tienes suficientes coins")
        
        # Verificar que no haya participado antes
        if RaffleParticipation.objects.filter(user=user, raffle=raffle).exists():
            raise serializers.ValidationError("Ya has participado en este sorteo")
        
        # Verificar que la cantidad sea válida
        if coins_amount <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        
        return attrs
