from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from api.views import (
    ping, register, login, logout_view, profile,
    user_coins, create_transaction, user_transactions,
    admin_transactions, approve_transaction, reject_transaction,
    battles_list, my_battles, create_battle, battle_detail,
    place_bet, my_bets, battle_bets, cancel_battle,
    battle_results, battle_result_detail, admin_influencers, process_battles,
    raffles_list, create_raffle, raffle_detail, participate_raffle,
    my_raffle_participations, raffle_participations, completed_raffles,
    process_raffle, processed_raffles,
    admin_referrals_summary, admin_referrals_detail, admin_referrals_csv
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/ping/", ping),
    path("api/auth/register/", register),
    path("api/auth/login/", login),
    path("api/auth/logout/", logout_view),
    path("api/auth/profile/", profile),
    
    # URLs para coins y transacciones
    path("api/coins/", user_coins),
    path("api/transactions/", create_transaction),
    path("api/transactions/history/", user_transactions),
    
    # URLs de administrador
    path("api/admin/transactions/", admin_transactions),
    path("api/admin/transactions/<int:transaction_id>/approve/", approve_transaction),
    path("api/admin/transactions/<int:transaction_id>/reject/", reject_transaction),

    # Admin referrals
    path("api/admin/referrals/summary/", admin_referrals_summary),
    path("api/admin/referrals/<int:referrer_id>/detail/", admin_referrals_detail),
    path("api/admin/referrals/summary.csv", admin_referrals_csv),
    
    # URLs para batallas
    path("api/battles/", battles_list),
    path("api/battles/my/", my_battles),
    path("api/battles/create/", create_battle),
    path("api/battles/<int:battle_id>/", battle_detail),
    path("api/battles/<int:battle_id>/bets/", battle_bets),
    path("api/battles/<int:battle_id>/cancel/", cancel_battle),
    path("api/battles/<int:battle_id>/result/", battle_result_detail),
    
    # URLs para apuestas
    path("api/bets/", place_bet),
    path("api/bets/my/", my_bets),
    
    # URLs de administrador para batallas
    path("api/admin/battles/results/", battle_results),
    path("api/admin/users/influencers/", admin_influencers),
    path("api/admin/battles/process/", process_battles),
    
    # URLs para sorteos
    path("api/raffles/", raffles_list),
    path("api/raffles/create/", create_raffle),
    path("api/raffles/<int:raffle_id>/", raffle_detail),
    path("api/raffles/<int:raffle_id>/participations/", raffle_participations),
    path("api/raffles/participate/", participate_raffle),
    path("api/raffles/my-participations/", my_raffle_participations),
    
    # URLs de administrador para sorteos
    path("api/admin/raffles/completed/", completed_raffles),
    path("api/admin/raffles/<int:raffle_id>/process/", process_raffle),
    path("api/admin/raffles/processed/", processed_raffles),
]

# Configurar URLs para archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
