import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCoins } from '../contexts/CoinsContext';
import { useBattles } from '../contexts/BattlesContext';
import { useRaffles } from '../contexts/RafflesContext';
import type { Battle } from '../types/battles';
import CoinPurchase from './CoinPurchase';
import TransactionHistory from './TransactionHistory';
import AdminTransactions from './AdminTransactions';
import ProcessBattlesButton from './ProcessBattlesButton';
import BattlesList from './BattlesList';
import MyBattles from './MyBattles';
import BattleBet from './BattleBet';
import CreateBattle from './CreateBattle';
import RafflesList from './RafflesList';
import CreateRaffle from './CreateRaffle';
import ProcessRaffles from './ProcessRaffles';
import { 
  LogOut, 
  Bell, 
  Search, 
  Coins,
  History,
  Shield,
  Trophy,
  Sword,
  Gift
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { coins } = useCoins();
  const { battles } = useBattles();
  const { raffles } = useRaffles();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBattleForBet, setSelectedBattleForBet] = useState<Battle | null>(null);

  const handleLogout = () => {
    logout();
  };

  // Calcular estadísticas reales de batallas
  const activeBattles = battles.filter(battle => battle.status === 'active');
  const finishedBattles = battles.filter(battle => battle.status === 'finished');
  const totalCoinsInBattles = battles.reduce((total, battle) => total + battle.total_coins, 0);
  const averageCoinsPerBattle = battles.length > 0 ? Math.round(totalCoinsInBattles / battles.length) : 0;

  // Calcular estadísticas de sorteos
  const activeRaffles = raffles.filter(raffle => raffle.status === 'active');
  const completedRaffles = raffles.filter(raffle => raffle.status === 'completed');
  const totalCoinsInRaffles = raffles.reduce((total, raffle) => total + raffle.current_amount, 0);

  const stats = [
    { 
      name: 'Batallas Activas', 
      value: activeBattles.length.toString(), 
      change: `${activeBattles.length > 0 ? '🔥' : '😴'}`, 
      icon: Sword, 
      bgColor: 'bg-red-100', 
      textColor: 'text-red-600' 
    },
    { 
      name: 'Sorteos Activos', 
      value: activeRaffles.length.toString(), 
      change: `${activeRaffles.length > 0 ? '🎁' : '📦'}`, 
      icon: Gift, 
      bgColor: 'bg-purple-100', 
      textColor: 'text-purple-600' 
    },
    { 
      name: 'Total Coins en Juego', 
      value: (totalCoinsInBattles + totalCoinsInRaffles).toString(), 
      change: `${(totalCoinsInBattles + totalCoinsInRaffles) > 0 ? '💰' : '💸'}`, 
      icon: Coins, 
      bgColor: 'bg-yellow-100', 
      textColor: 'text-yellow-600' 
    },
    { 
      name: 'Sorteos Completados', 
      value: completedRaffles.length.toString(), 
      change: `${completedRaffles.length > 0 ? '✅' : '⏳'}`, 
      icon: Trophy, 
      bgColor: 'bg-green-100', 
      textColor: 'text-green-600' 
    },
  ];

  // Generar actividad reciente basada en batallas
  const recentActivity = [
    ...activeBattles.slice(0, 2).map((battle) => ({
      id: `battle-${battle.id}`,
      action: `Batalla activa: ${battle.title}`,
      time: `${battle.time_remaining > 0 ? Math.floor(battle.time_remaining / 3600) : 0}h restantes`,
      type: 'battle' as const,
      battle
    })),
    ...finishedBattles.slice(0, 2).map((battle) => ({
      id: `finished-${battle.id}`,
      action: `Batalla terminada: ${battle.title}`,
      time: 'Recientemente',
      type: 'finished' as const,
      battle
    }))
  ].slice(0, 4);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-sm text-gray-600 font-medium">{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">
                      {stat.name === 'Batallas Activas' && (activeBattles.length > 0 ? 'En progreso' : 'Sin actividad')}
                      {stat.name === 'Batallas Terminadas' && (finishedBattles.length > 0 ? 'Completadas' : 'Pendientes')}
                      {stat.name === 'Total Coins en Juego' && (totalCoinsInBattles > 0 ? 'En disputa' : 'Sin coins')}
                      {stat.name === 'Promedio por Batalla' && (averageCoinsPerBattle > 0 ? 'Promedio' : 'Sin datos')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab('coins')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Coins className="w-8 h-8 text-yellow-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Comprar Coins</span>
                </button>
                <button 
                  onClick={() => setActiveTab('battles')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Sword className="w-8 h-8 text-red-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Batallas</span>
                </button>
                <button 
                  onClick={() => setActiveTab('raffles')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Gift className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Sorteos</span>
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <History className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Historial</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div 
                      key={activity.id} 
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        activity.type === 'battle' 
                          ? 'hover:bg-blue-50 cursor-pointer border border-blue-100' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (activity.type === 'battle') {
                          setActiveTab('battles');
                        }
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'battle' ? 'bg-red-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      {activity.type === 'battle' && (
                        <Sword className="w-4 h-4 text-red-500" />
                      )}
                      {activity.type === 'finished' && (
                        <Trophy className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay actividad reciente</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'coins':
        return <CoinPurchase />;
      case 'battles':
        return <BattlesList />;
      case 'my-battles':
        return <MyBattles />;
      case 'create-battle':
        return <CreateBattle />;
      case 'raffles':
        return <RafflesList />;
      case 'create-raffle':
        return <CreateRaffle />;
      case 'process-raffles':
        return <ProcessRaffles />;
      case 'history':
        return <TransactionHistory />;
      case 'admin':
        return (
          <div className="space-y-6">
            <ProcessBattlesButton />
            <AdminTransactions />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Raqi</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Coins Display */}
              <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-800">{coins} coins</span>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <div className="h-10 w-10 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('coins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'coins'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Comprar Coins
            </button>
            <button
              onClick={() => setActiveTab('battles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                activeTab === 'battles'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Sword className="w-4 h-4" />
              <span>Batallas</span>
            </button>
            {user?.is_influencer && (
              <button
                onClick={() => setActiveTab('my-battles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                  activeTab === 'my-battles'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Mis Batallas</span>
              </button>
            )}
            {user?.is_staff && (
              <button
                onClick={() => setActiveTab('create-battle')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                  activeTab === 'create-battle'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Sword className="w-4 h-4" />
                <span>Crear Batalla</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('raffles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                activeTab === 'raffles'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Sorteos</span>
            </button>
            {user?.is_staff && (
              <button
                onClick={() => setActiveTab('create-raffle')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                  activeTab === 'create-raffle'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Crear Sorteo</span>
              </button>
            )}
            {user?.is_staff && (
              <button
                onClick={() => setActiveTab('process-raffles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                  activeTab === 'process-raffles'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Procesar Sorteos</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Historial
            </button>
            {user?.is_staff && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                  activeTab === 'admin'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Administración</span>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          {activeTab === 'overview' && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Bienvenido de vuelta, {user?.first_name}! 👋
              </h2>
              <p className="text-gray-600">
                Aquí tienes un resumen de tu actividad reciente
              </p>
            </div>
          )}

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {renderTabContent()}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Profile Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="mx-auto h-20 w-20 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-2xl">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {user?.first_name} {user?.last_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{user?.email}</p>
                  
                  {/* Coins Display */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Coins className="w-5 h-5 text-yellow-600" />
                      <span className="text-lg font-bold text-yellow-800">{coins} coins</span>
                    </div>
                  </div>
                  
                  <button className="w-full btn-secondary rounded-lg">
                    Editar Perfil
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Personales</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Coins disponibles</span>
                    <span className="text-sm font-medium text-gray-900">{coins}</span>
                  </div>
                  {user?.is_influencer && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rol</span>
                      <span className="text-sm font-medium text-purple-600">Influencer</span>
                    </div>
                  )}
                  {user?.is_staff && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rol</span>
                      <span className="text-sm font-medium text-red-600">Administrador</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Batallas activas</span>
                    <span className="text-sm font-medium text-gray-900">{activeBattles.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sorteos activos</span>
                    <span className="text-sm font-medium text-gray-900">{activeRaffles.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total batallas</span>
                    <span className="text-sm font-medium text-gray-900">{battles.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total sorteos</span>
                    <span className="text-sm font-medium text-gray-900">{raffles.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Battle Bet Modal */}
      {selectedBattleForBet && (
        <BattleBet
          battle={selectedBattleForBet}
          onClose={() => setSelectedBattleForBet(null)}
          onSuccess={() => {
            // Refresh data after successful bet
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
