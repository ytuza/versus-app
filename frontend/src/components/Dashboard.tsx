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
import AdminReferrals from './AdminReferrals';
import { 
  LogOut, 
  Bell, 
  Search, 
  Coins,
  History,
  Shield,
  Trophy,
  Sword,
  Gift,
  Menu,
  X
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { coins } = useCoins();
  const { battles } = useBattles();
  const { raffles } = useRaffles();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBattleForBet, setSelectedBattleForBet] = useState<Battle | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  // Calcular estadísticas reales de batallas
  const activeBattles = battles.filter(battle => battle.status === 'active');
  const finishedBattles = battles.filter(battle => battle.status === 'finished');
  const totalCoinsInBattles = battles.reduce((total, battle) => total + battle.total_coins, 0);

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
      bgColor: 'bg-primary-100', 
      textColor: 'text-primary-600' 
    },
    { 
      name: 'Sorteos Activos', 
      value: activeRaffles.length.toString(), 
      change: `${activeRaffles.length > 0 ? '🎁' : '📦'}`, 
      icon: Gift, 
      bgColor: 'bg-secondary-100', 
      textColor: 'text-secondary-600' 
    },
    { 
      name: 'Total Coins en Juego', 
      value: (totalCoinsInBattles + totalCoinsInRaffles).toString(), 
      change: `${(totalCoinsInBattles + totalCoinsInRaffles) > 0 ? '💰' : '💸'}`, 
      icon: Coins, 
      bgColor: 'bg-accent-100', 
      textColor: 'text-accent-600' 
    },
    { 
      name: 'Sorteos Completados', 
      value: completedRaffles.length.toString(), 
      change: `${completedRaffles.length > 0 ? '✅' : '⏳'}`, 
      icon: Trophy, 
      bgColor: 'bg-primary-100', 
      textColor: 'text-primary-600' 
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="card-elegant p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-accent-600 mb-1">{stat.name}</p>
                      <p className="text-3xl font-bold text-gradient">{stat.value}</p>
                    </div>
                    <div className={`p-4 rounded-xl shadow-lg ${stat.bgColor} animate-float`} style={{ animationDelay: `${index * 0.2}s` }}>
                      <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-lg font-bold text-accent-600">{stat.change}</span>
                    <span className="text-sm text-accent-500 ml-2">
                      {stat.name === 'Batallas Activas' && (activeBattles.length > 0 ? 'En progreso' : 'Sin actividad')}
                      {stat.name === 'Sorteos Activos' && (activeRaffles.length > 0 ? 'Disponibles' : 'Sin sorteos')}
                      {stat.name === 'Total Coins en Juego' && (totalCoinsInBattles > 0 ? 'En disputa' : 'Sin coins')}
                      {stat.name === 'Sorteos Completados' && (completedRaffles.length > 0 ? 'Finalizados' : 'Pendientes')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="card-premium p-6 animate-slide-up">
              <h3 className="text-xl font-bold text-gradient mb-6">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab('coins')}
                  className="flex flex-col items-center p-6 border border-accent-200 rounded-xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl mb-3">
                    <Coins className="w-8 h-8 text-yellow-600" />
                  </div>
                  <span className="text-sm font-semibold text-accent-700">Comprar Coins</span>
                </button>
                <button 
                  onClick={() => setActiveTab('battles')}
                  className="flex flex-col items-center p-6 border border-accent-200 rounded-xl hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl mb-3">
                    <Sword className="w-8 h-8 text-red-600" />
                  </div>
                  <span className="text-sm font-semibold text-accent-700">Batallas</span>
                </button>
                <button 
                  onClick={() => setActiveTab('raffles')}
                  className="flex flex-col items-center p-6 border border-accent-200 rounded-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl mb-3">
                    <Gift className="w-8 h-8 text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-accent-700">Sorteos</span>
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className="flex flex-col items-center p-6 border border-accent-200 rounded-xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl mb-3">
                    <History className="w-8 h-8 text-primary-600" />
                  </div>
                  <span className="text-sm font-semibold text-accent-700">Historial</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card-elegant p-6 animate-fade-in">
              <h3 className="text-xl font-bold text-gradient mb-6">Actividad Reciente</h3>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div 
                      key={activity.id} 
                      className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                        activity.type === 'battle' 
                          ? 'hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 cursor-pointer border border-primary-200 shadow-sm hover:shadow-md' 
                          : 'hover:bg-gradient-to-r hover:from-accent-50 hover:to-accent-100 border border-accent-200'
                      }`}
                      onClick={() => {
                        if (activity.type === 'battle') {
                          setActiveTab('battles');
                        }
                      }}
                    >
                      <div className={`w-3 h-3 rounded-full shadow-sm ${
                        activity.type === 'battle' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-accent-800">{activity.action}</p>
                        <p className="text-xs text-accent-500 font-medium">{activity.time}</p>
                      </div>
                      {activity.type === 'battle' && (
                        <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
                          <Sword className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                      {activity.type === 'finished' && (
                        <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                          <Trophy className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Trophy className="h-10 w-10 text-accent-500" />
                    </div>
                    <p className="text-accent-600 font-medium">No hay actividad reciente</p>
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
            <AdminReferrals />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <header className="glass-effect border-b border-accent-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center">
                <img src="/versus-app/raqi-logo-alt.png" alt="Raqi" className="h-full w-full object-contain" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gradient">Raqi</h1>
            </div>
            
            {/* Desktop Header Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Coins Display */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-secondary-100 px-4 py-2.5 rounded-xl shadow-md border border-primary-200">
                <Coins className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-bold text-primary-800">{coins} coins</span>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="input-field pl-10 pr-4 w-64"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2.5 text-accent-400 hover:text-primary-600 transition-all duration-200 hover:bg-primary-50 rounded-lg">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm"></span>
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-accent-800">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-xs text-accent-500">{user?.email}</div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-elegant flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Salir</span>
                </button>
              </div>
            </div>

            {/* Mobile Header Actions */}
            <div className="flex lg:hidden items-center space-x-2">
              {/* Coins Display - Mobile */}
              <div className="flex items-center space-x-1 bg-gradient-to-r from-primary-100 to-secondary-100 px-2 py-1.5 rounded-lg shadow-md border border-primary-200">
                <Coins className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-bold text-primary-800">{coins}</span>
              </div>
              
              {/* Notifications - Mobile */}
              <button className="relative p-2 text-accent-400 hover:text-primary-600 transition-all duration-200 hover:bg-primary-50 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm"></span>
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-accent-400 hover:text-primary-600 transition-all duration-200 hover:bg-primary-50 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="glass-effect border-b border-accent-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-accent-500 hover:text-accent-700 hover:border-accent-300'
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

          {/* Mobile Navigation */}
          <div className={`lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <nav className="flex flex-col space-y-2 py-4">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-primary-100 text-primary-600 border border-primary-200'
                    : 'text-accent-600 hover:bg-accent-50'
                }`}
              >
                <span>Resumen</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('coins');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'coins'
                    ? 'bg-primary-100 text-primary-600 border border-primary-200'
                    : 'text-accent-600 hover:bg-accent-50'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Comprar Coins</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('battles');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'battles'
                    ? 'bg-primary-100 text-primary-600 border border-primary-200'
                    : 'text-accent-600 hover:bg-accent-50'
                }`}
              >
                <Sword className="w-4 h-4" />
                <span>Batallas</span>
              </button>
              {user?.is_influencer && (
                <button
                  onClick={() => {
                    setActiveTab('my-battles');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === 'my-battles'
                      ? 'bg-primary-100 text-primary-600 border border-primary-200'
                      : 'text-accent-600 hover:bg-accent-50'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Mis Batallas</span>
                </button>
              )}
              {user?.is_staff && (
                <button
                  onClick={() => {
                    setActiveTab('create-battle');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === 'create-battle'
                      ? 'bg-primary-100 text-primary-600 border border-primary-200'
                      : 'text-accent-600 hover:bg-accent-50'
                  }`}
                >
                  <Sword className="w-4 h-4" />
                  <span>Crear Batalla</span>
                </button>
              )}
              <button
                onClick={() => {
                  setActiveTab('raffles');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'raffles'
                    ? 'bg-primary-100 text-primary-600 border border-primary-200'
                    : 'text-accent-600 hover:bg-accent-50'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Sorteos</span>
              </button>
              {user?.is_staff && (
                <button
                  onClick={() => {
                    setActiveTab('create-raffle');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === 'create-raffle'
                      ? 'bg-primary-100 text-primary-600 border border-primary-200'
                      : 'text-accent-600 hover:bg-accent-50'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>Crear Sorteo</span>
                </button>
              )}
              {user?.is_staff && (
                <button
                  onClick={() => {
                    setActiveTab('process-raffles');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === 'process-raffles'
                      ? 'bg-primary-100 text-primary-600 border border-primary-200'
                      : 'text-accent-600 hover:bg-accent-50'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Procesar Sorteos</span>
                </button>
              )}
              <button
                onClick={() => {
                  setActiveTab('history');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'history'
                    ? 'bg-primary-100 text-primary-600 border border-primary-200'
                    : 'text-accent-600 hover:bg-accent-50'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Historial</span>
              </button>
              {user?.is_staff && (
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === 'admin'
                      ? 'bg-primary-100 text-primary-600 border border-primary-200'
                      : 'text-accent-600 hover:bg-accent-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Administración</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          {activeTab === 'overview' && (
            <div className="mb-6 sm:mb-8 animate-fade-in">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient mb-2 sm:mb-3">
                ¡Bienvenido de vuelta, {user?.first_name}! 👋
              </h2>
              <p className="text-accent-600 text-base sm:text-lg font-medium">
                Aquí tienes un resumen de tu actividad reciente
              </p>
            </div>
          )}

          {/* Tab Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2">
              {renderTabContent()}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 order-first xl:order-last">
              {/* User Profile Card */}
              <div className="card-premium p-4 sm:p-6 animate-scale-in">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 sm:h-24 sm:w-24 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl">
                    <span className="text-white font-bold text-lg sm:text-2xl">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-accent-800 mb-1 sm:mb-2">
                    {user?.first_name} {user?.last_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-accent-500 mb-4 sm:mb-6 font-medium">{user?.email}</p>
                  
                  {/* Coins Display */}
                  <div className="bg-gradient-to-r from-primary-100 to-secondary-100 border border-primary-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-md">
                    <div className="flex items-center justify-center space-x-2">
                      <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                      <span className="text-lg sm:text-xl font-bold text-primary-800">{coins} coins</span>
                    </div>
                  </div>

                  {/* Referral Code Display */}
                  {user?.referral_code && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-emerald-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-emerald-700">Tu código de referido</p>
                          <p className="text-lg font-bold text-emerald-700 tracking-widest">{user.referral_code}</p>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(user.referral_code!)}
                          className="text-xs bg-emerald-600 text-white px-3 py-2 rounded-md hover:bg-emerald-700"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <button className="w-full btn-primary text-sm sm:text-base">
                    Editar Perfil
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card-elegant p-4 sm:p-6 animate-slide-up">
                <h3 className="text-lg sm:text-xl font-bold text-gradient mb-4 sm:mb-6">Estadísticas Personales</h3>
                <div className="space-y-5">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl">
                    <span className="text-sm font-semibold text-accent-700">Coins disponibles</span>
                    <span className="text-sm font-bold text-primary-600">{coins}</span>
                  </div>
                  {user?.is_influencer && (
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                      <span className="text-sm font-semibold text-accent-700">Rol</span>
                      <span className="text-sm font-bold text-purple-600">Influencer</span>
                    </div>
                  )}
                  {user?.is_staff && (
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
                      <span className="text-sm font-semibold text-accent-700">Rol</span>
                      <span className="text-sm font-bold text-red-600">Administrador</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl">
                    <span className="text-sm font-semibold text-accent-700">Batallas activas</span>
                    <span className="text-sm font-bold text-primary-600">{activeBattles.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl">
                    <span className="text-sm font-semibold text-accent-700">Sorteos activos</span>
                    <span className="text-sm font-bold text-secondary-600">{activeRaffles.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl">
                    <span className="text-sm font-semibold text-accent-700">Total batallas</span>
                    <span className="text-sm font-bold text-accent-600">{battles.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl">
                    <span className="text-sm font-semibold text-accent-700">Total sorteos</span>
                    <span className="text-sm font-bold text-accent-600">{raffles.length}</span>
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
