import React, { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useSession } from '~/lib/auth-client';
import { YallaCard } from './YallaCard';
import { CreateYallaModal } from './CreateYallaModal';
import { YallaModal } from './YallaModal';
import { Yalla } from '~/types';

export function Yallas() {
  const { data: session } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedYalla, setSelectedYalla] = useState<Yalla | null>(null);
  const [isYallaModalOpen, setIsYallaModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'community' | 'assigned' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get yallas for the current user
  const yallasQuery = useSuspenseQuery(
    convexQuery(api.yallas.getUserYallas, {
      authUserId: session?.user?.id,
    })
  );

  // Transform Convex data to match our types
  const allYallas = (yallasQuery.data || []).map(yalla => ({
    ...yalla,
    createdAt: new Date(yalla.createdAt),
    updatedAt: new Date(yalla.updatedAt),
    dueDate: yalla.dueDate ? new Date(yalla.dueDate) : undefined,
    completedAt: yalla.completedAt ? new Date(yalla.completedAt) : undefined,
    votes: yalla.votes.map(vote => ({
      ...vote,
      createdAt: new Date(vote.createdAt),
    })),
  }));

  const handleViewYalla = (yalla: Yalla) => {
    setSelectedYalla(yalla);
    setIsYallaModalOpen(true);
  };

  const filteredYallas = allYallas.filter(yalla => {
    const matchesFilter = filter === 'all' || yalla.type === filter || yalla.status === filter;
    const matchesSearch = yalla.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (yalla.description && yalla.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // Separate completed and active yallas
  const activeYallas = filteredYallas.filter(yalla => yalla.status !== 'completed');
  const completedYallas = filteredYallas.filter(yalla => yalla.status === 'completed');

  const filterOptions = [
    { value: 'all', label: 'All Yallas', count: allYallas.length },
    { value: 'community', label: 'Community', count: allYallas.filter(y => y.type === 'community').length },
    { value: 'assigned', label: 'Assigned', count: allYallas.filter(y => y.type === 'assigned').length },
    { value: 'completed', label: 'Completed', count: allYallas.filter(y => y.status === 'completed').length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">Yallas ⚡</h1>
          <p className="text-xl text-purple-700 mt-2 font-medium">
            Drop tasks, vote on vibes, and crush goals with your squad! 🔥
          </p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-8 py-4 rounded-full flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg font-bold text-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Drop Yalla</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-3xl shadow-xl border-0 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Find your vibe... 🔍"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-0 bg-purple-50 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:bg-white shadow-inner placeholder-purple-400 text-purple-800 font-medium text-lg"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Filter className="h-6 w-6 text-purple-400" />
            <div className="flex space-x-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as any)}
                  className={`px-5 py-3 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${
                    filter === option.value
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-purple-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-400 hover:to-pink-400 border-2 border-purple-200'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Yallas Grid */}
      {filteredYallas.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-9xl mb-8">🚀</div>
          <h2 className="text-4xl font-black text-purple-600 mb-6">
            {searchTerm || filter !== 'all' ? 'No vibes found, bestie!' : 'No drops yet!'}
          </h2>
          <p className="text-xl text-purple-500 mb-10 max-w-lg mx-auto font-medium">
            {searchTerm || filter !== 'all' 
              ? 'Try switching up your search game to find those fire yallas! 🔍'
              : 'Time to drop your first yalla and get the squad hyped! Let\'s make some magic happen! ✨'
            }
          </p>
          {!searchTerm && filter === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-300 hover:to-pink-400 text-white px-12 py-5 rounded-full text-xl font-black transition-all transform hover:scale-105 shadow-xl"
            >
              Drop Your First Yalla 🔥
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Yallas */}
          {activeYallas.length > 0 && (
            <div>
              <h2 className="text-3xl font-black text-purple-600 mb-6 flex items-center">
                <span className="mr-3">🔥</span>
                Active Drops ({activeYallas.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeYallas.map((yalla) => (
                  <YallaCard key={yalla.id} yalla={yalla} onViewDetails={handleViewYalla} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Yallas */}
          {completedYallas.length > 0 && (
            <div>
              {activeYallas.length > 0 && (
                <div className="flex items-center my-12">
                  <div className="flex-1 h-1 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full"></div>
                  <div className="px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border-2 border-green-200">
                    <span className="text-green-700 font-black text-lg">🏆 Hall of Fame 🏆</span>
                  </div>
                  <div className="flex-1 h-1 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full"></div>
                </div>
              )}
              
              <h2 className="text-3xl font-black text-green-600 mb-6 flex items-center">
                <span className="mr-3">✅</span>
                Crushed Yallas ({completedYallas.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                {completedYallas.map((yalla) => (
                  <YallaCard key={yalla.id} yalla={yalla} onViewDetails={handleViewYalla} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateYallaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      <YallaModal
        yalla={selectedYalla}
        isOpen={isYallaModalOpen}
        onClose={() => {
          setIsYallaModalOpen(false);
          setSelectedYalla(null);
        }}
      />
    </div>
  );
}