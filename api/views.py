from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404
from django.db import transaction as db_transaction
from django.core.management import call_command
from django.utils import timezone
from io import StringIO
import sys
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    TransactionSerializer, TransactionCreateSerializer, TransactionAdminSerializer, UserCoinsSerializer,
    BattleSerializer, BattleCreateSerializer, BattleBetSerializer, BattleBetCreateSerializer, BattleResultSerializer,
    RaffleSerializer, RaffleCreateSerializer, RaffleParticipationSerializer, RaffleParticipationCreateSerializer
)
from .models import User, UserProfile, Transaction, Battle, BattleBet, BattleResult, Raffle, RaffleParticipation
from django.db import models

@api_view(["GET"])
def ping(request):
    return Response({"ok": True, "msg": "pong"})

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'Usuario registrado exitosamente',
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'Login exitoso',
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except:
        pass
    logout(request)
    return Response({'message': 'Logout exitoso'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    try:
        profile = request.user.profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Perfil no encontrado'}, status=status.HTTP_404_NOT_FOUND)

# Vistas para transacciones de coins
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_coins(request):
    """Obtener balance de coins del usuario"""
    try:
        profile = request.user.profile
        serializer = UserCoinsSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Perfil no encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_transaction(request):
    """Crear una nueva transacción de compra de coins"""
    serializer = TransactionCreateSerializer(data=request.data)
    if serializer.is_valid():
        # Crear la transacción asociada al usuario actual
        transaction = serializer.save(user=request.user)
        full_serializer = TransactionSerializer(transaction)
        return Response({
            'message': 'Transacción creada exitosamente. Espera la aprobación del administrador.',
            'transaction': full_serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_transactions(request):
    """Obtener transacciones del usuario actual"""
    transactions = Transaction.objects.filter(user=request.user)
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Vistas de administrador (solo para admins)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_transactions(request):
    """Obtener todas las transacciones (solo para admins)"""
    status_filter = request.query_params.get('status', None)
    transactions = Transaction.objects.all()
    
    if status_filter:
        transactions = transactions.filter(status=status_filter)
    
    serializer = TransactionAdminSerializer(transactions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def approve_transaction(request, transaction_id):
    """Aprobar una transacción (solo para admins)"""
    transaction = get_object_or_404(Transaction, id=transaction_id)
    
    if transaction.status != 'pending':
        return Response({
            'error': 'Solo se pueden aprobar transacciones pendientes'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with db_transaction.atomic():
            # Actualizar el estado de la transacción
            transaction.status = 'approved'
            transaction.approved_by = request.user
            transaction.save()
            
            # Sumar los coins al usuario
            user_profile = transaction.user.profile
            user_profile.coins += transaction.amount
            user_profile.save()
            
            serializer = TransactionAdminSerializer(transaction)
            return Response({
                'message': 'Transacción aprobada exitosamente',
                'transaction': serializer.data
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Error al procesar la transacción'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def reject_transaction(request, transaction_id):
    """Rechazar una transacción (solo para admins)"""
    transaction = get_object_or_404(Transaction, id=transaction_id)
    
    if transaction.status != 'pending':
        return Response({
            'error': 'Solo se pueden rechazar transacciones pendientes'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Obtener las notas del admin del request
    admin_notes = request.data.get('admin_notes', '')
    
    transaction.status = 'rejected'
    transaction.approved_by = request.user
    transaction.admin_notes = admin_notes
    transaction.save()
    
    serializer = TransactionAdminSerializer(transaction)
    return Response({
        'message': 'Transacción rechazada',
        'transaction': serializer.data
    }, status=status.HTTP_200_OK)

# Vistas para batallas
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def battles_list(request):
    """Obtener lista de batallas activas"""
    battles = Battle.objects.filter(status='active').order_by('-created_at')
    serializer = BattleSerializer(battles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_battles(request):
    """Obtener batallas del influencer (solo para influencers)"""
    if not request.user.profile.is_influencer:
        return Response({
            'error': 'Solo los influencers pueden ver sus batallas'
        }, status=status.HTTP_403_FORBIDDEN)
    
    battles = Battle.objects.filter(
        models.Q(influencer_a=request.user) | models.Q(influencer_b=request.user)
    ).order_by('-created_at')
    
    serializer = BattleSerializer(battles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_battle(request):
    """Crear una nueva batalla (solo para admins)"""
    serializer = BattleCreateSerializer(data=request.data)
    if serializer.is_valid():
        battle = serializer.save(created_by=request.user)
        full_serializer = BattleSerializer(battle)
        return Response({
            'message': 'Batalla creada exitosamente',
            'battle': full_serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def battle_detail(request, battle_id):
    """Obtener detalles de una batalla específica"""
    battle = get_object_or_404(Battle, id=battle_id)
    serializer = BattleSerializer(battle)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_bet(request):
    """Hacer una apuesta en una batalla"""
    serializer = BattleBetCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        bet = serializer.save(user=request.user)
        full_serializer = BattleBetSerializer(bet)
        return Response({
            'message': 'Apuesta realizada exitosamente',
            'bet': full_serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_bets(request):
    """Obtener apuestas del usuario actual"""
    bets = BattleBet.objects.filter(user=request.user).order_by('-created_at')
    serializer = BattleBetSerializer(bets, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def battle_bets(request, battle_id):
    """Obtener todas las apuestas de una batalla específica"""
    battle = get_object_or_404(Battle, id=battle_id)
    bets = battle.bets.all().order_by('-created_at')
    serializer = BattleBetSerializer(bets, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def cancel_battle(request, battle_id):
    """Cancelar una batalla (solo para admins)"""
    battle = get_object_or_404(Battle, id=battle_id)
    
    if battle.status != 'active':
        return Response({
            'error': 'Solo se pueden cancelar batallas activas'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with db_transaction.atomic():
            # Cambiar estado a cancelada
            battle.status = 'cancelled'
            battle.save()
            
            # Devolver coins a todos los usuarios que apostaron
            for bet in battle.bets.all():
                user_profile = bet.user.profile
                user_profile.coins += bet.coins_amount
                user_profile.save()
            
            serializer = BattleSerializer(battle)
            return Response({
                'message': 'Batalla cancelada exitosamente. Los coins han sido devueltos.',
                'battle': serializer.data
            }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Error al cancelar la batalla'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def battle_results(request):
    """Obtener resultados de batallas terminadas (solo para admins)"""
    results = BattleResult.objects.all().order_by('-created_at')
    serializer = BattleResultSerializer(results, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def battle_result_detail(request, battle_id):
    """Obtener resultado de una batalla específica"""
    battle = get_object_or_404(Battle, id=battle_id)
    
    if not hasattr(battle, 'result'):
        return Response({
            'error': 'Esta batalla aún no tiene resultados'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = BattleResultSerializer(battle.result)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_influencers(request):
    """Obtener lista de usuarios influencers (solo para admins)"""
    influencers = User.objects.filter(profile__is_influencer=True).select_related('profile')
    
    data = []
    for user in influencers:
        data.append({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_influencer': user.profile.is_influencer
        })
    
    return Response(data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def process_battles(request):
    """Ejecutar el proceso de batallas terminadas desde el frontend"""
    try:
        # Capturar la salida del comando
        output = StringIO()
        old_stdout = sys.stdout
        sys.stdout = output
        
        # Ejecutar el comando process_battles
        call_command('process_battles')
        
        # Restaurar stdout
        sys.stdout = old_stdout
        command_output = output.getvalue()
        
        # Contar batallas procesadas
        processed_count = command_output.count('✅ Batalla')
        
        return Response({
            'success': True,
            'message': f'Proceso completado. {processed_count} batallas procesadas.',
            'output': command_output,
            'processed_count': processed_count
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        # Restaurar stdout en caso de error
        sys.stdout = old_stdout
        return Response({
            'success': False,
            'message': f'Error ejecutando el proceso: {str(e)}',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vistas para sorteos
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def raffles_list(request):
    """Obtener lista de sorteos activos"""
    status_filter = request.query_params.get('status', 'active')
    raffles = Raffle.objects.all()
    
    if status_filter:
        raffles = raffles.filter(status=status_filter)
    
    serializer = RaffleSerializer(raffles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_raffle(request):
    """Crear una nueva sorteo (solo para admins)"""
    serializer = RaffleCreateSerializer(data=request.data)
    if serializer.is_valid():
        raffle = serializer.save(created_by=request.user)
        full_serializer = RaffleSerializer(raffle)
        return Response({
            'message': 'Sorteo creado exitosamente',
            'raffle': full_serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def raffle_detail(request, raffle_id):
    """Obtener detalles de un sorteo específico"""
    raffle = get_object_or_404(Raffle, id=raffle_id)
    serializer = RaffleSerializer(raffle)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def participate_raffle(request):
    """Participar en un sorteo"""
    serializer = RaffleParticipationCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        participation = serializer.save(user=request.user)
        full_serializer = RaffleParticipationSerializer(participation)
        return Response({
            'message': 'Participación exitosa en el sorteo',
            'participation': full_serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_raffle_participations(request):
    """Obtener participaciones del usuario actual"""
    participations = RaffleParticipation.objects.filter(user=request.user).order_by('-created_at')
    serializer = RaffleParticipationSerializer(participations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def raffle_participations(request, raffle_id):
    """Obtener todas las participaciones de un sorteo específico"""
    raffle = get_object_or_404(Raffle, id=raffle_id)
    participations = raffle.participations.all().order_by('-created_at')
    serializer = RaffleParticipationSerializer(participations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def completed_raffles(request):
    """Obtener sorteos completados para procesar (solo para admins)"""
    raffles = Raffle.objects.filter(status='completed').order_by('-created_at')
    serializer = RaffleSerializer(raffles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def process_raffle(request, raffle_id):
    """Procesar un sorteo completado y seleccionar ganador (solo para admins)"""
    raffle = get_object_or_404(Raffle, id=raffle_id)
    
    if raffle.status != 'completed':
        return Response({
            'error': 'Solo se pueden procesar sorteos completados'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        winner = raffle.select_winner()
        if winner:
            serializer = RaffleSerializer(raffle)
            return Response({
                'message': f'Sorteo procesado exitosamente. Ganador: {winner.get_full_name()}',
                'raffle': serializer.data,
                'winner': {
                    'id': winner.id,
                    'name': winner.get_full_name(),
                    'email': winner.email
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'No se pudo seleccionar un ganador'
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': f'Error al procesar el sorteo: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def processed_raffles(request):
    """Obtener sorteos procesados (solo para admins)"""
    raffles = Raffle.objects.filter(status='processed').order_by('-processed_at')
    serializer = RaffleSerializer(raffles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
