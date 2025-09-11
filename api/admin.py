from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile, Transaction, Battle, BattleBet, BattleResult

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['email', 'first_name', 'last_name', 'is_staff', 'is_active']
    list_filter = ['is_staff', 'is_active']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['email']

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'coins', 'is_influencer', 'created_at', 'updated_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    list_filter = ['is_influencer', 'created_at']
    actions = ['make_influencer', 'remove_influencer']

    def make_influencer(self, request, queryset):
        queryset.update(is_influencer=True)
    make_influencer.short_description = "Marcar como influencer"

    def remove_influencer(self, request, queryset):
        queryset.update(is_influencer=False)
    remove_influencer.short_description = "Quitar rol de influencer"

class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'total_price', 'status', 'created_at', 'approved_by']
    list_filter = ['status', 'created_at', 'updated_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at', 'total_price']
    fieldsets = (
        ('Información de la Transacción', {
            'fields': ('user', 'amount', 'total_price', 'status')
        }),
        ('Pago', {
            'fields': ('payment_image',)
        }),
        ('Administración', {
            'fields': ('approved_by', 'admin_notes')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Los admins normales solo ven transacciones pendientes
        return qs.filter(status='pending')

admin.site.register(User, CustomUserAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Transaction, TransactionAdmin)

class BattleBetInline(admin.TabularInline):
    model = BattleBet
    extra = 0
    readonly_fields = ['user', 'influencer_choice', 'coins_amount', 'created_at']

class BattleAdmin(admin.ModelAdmin):
    list_display = ['title', 'influencer_a', 'influencer_b', 'status', 'total_coins', 'time_remaining_display', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'influencer_a__email', 'influencer_b__email']
    readonly_fields = ['total_coins_a', 'total_coins_b', 'created_at', 'updated_at']
    inlines = [BattleBetInline]
    
    def time_remaining_display(self, obj):
        if obj.status == 'active':
            seconds = obj.time_remaining
            if seconds > 0:
                hours = seconds // 3600
                minutes = (seconds % 3600) // 60
                return f"{hours}h {minutes}m"
            else:
                return "Terminado"
        return "-"
    time_remaining_display.short_description = "Tiempo Restante"

    def total_coins(self, obj):
        return obj.total_coins
    total_coins.short_description = "Total Coins"

class BattleBetAdmin(admin.ModelAdmin):
    list_display = ['user', 'battle', 'influencer_choice', 'coins_amount', 'created_at']
    list_filter = ['influencer_choice', 'created_at']
    search_fields = ['user__email', 'battle__title']
    readonly_fields = ['created_at']

class BattleResultAdmin(admin.ModelAdmin):
    list_display = ['battle', 'winner', 'platform_profit', 'winner_profit', 'sorteo_winner', 'created_at']
    list_filter = ['created_at']
    search_fields = ['battle__title', 'winner__email', 'sorteo_winner__email']
    readonly_fields = ['created_at']

admin.site.register(Battle, BattleAdmin)
admin.site.register(BattleBet, BattleBetAdmin)
admin.site.register(BattleResult, BattleResultAdmin)
