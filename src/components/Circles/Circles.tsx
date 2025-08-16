import React, { useState } from 'react';
import { Plus, Users, Settings, MoreVertical } from 'lucide-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useSession } from '~/lib/auth-client';
import { CreateCircleModal } from './CreateCircleModal';

export function Circles() {
  const { data: session } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get circles for the current user
  const circlesQuery = useSuspenseQuery(
    convexQuery(api.circles.getUserCircles, {
      authUserId: session?.user?.id,
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">Your Squad 💫</h1>
          <p className="text-xl text-purple-700 mt-2 font-medium">
            Build your crew and create epic vibes together! 🔥
          </p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-8 py-4 rounded-full flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg font-bold text-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Build Squad</span>
        </button>
      </div>

      {circlesQuery.data.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-9xl mb-8">🚀</div>
          <h2 className="text-4xl font-black text-purple-600 mb-6">No squad yet, bestie!</h2>
          <p className="text-xl text-purple-500 mb-10 max-w-lg mx-auto font-medium">
            Time to gather your homies and start dropping some epic yallas together! Let's build that dream team! 💪
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-300 hover:to-pink-400 text-white px-12 py-5 rounded-full text-xl font-black transition-all transform hover:scale-105 shadow-xl"
          >
            Build Your First Squad 🔥
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circlesQuery.data.map((circle) => (
            <div
              key={circle.id}
              className="bg-white rounded-3xl shadow-xl border-0 p-8 hover:shadow-2xl transition-all transform hover:scale-105 hover:-rotate-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mr-4 shadow-lg"
                    style={{ backgroundColor: circle.color + '20' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full shadow-sm"
                      style={{ backgroundColor: circle.color }}
                    ></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{circle.name}</h3>
                    <p className="text-sm text-purple-600 flex items-center font-bold">
                      <Users className="h-4 w-4 mr-1" />
                      {circle.members.length} homies
                    </p>
                  </div>
                </div>
                
                <button className="text-purple-400 hover:text-purple-600 p-2 hover:bg-purple-50 rounded-full transition-all">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-purple-600 mb-6 font-medium text-lg">{circle.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-purple-500 font-bold">
                  0 active drops 🔥
                </div>
                
                <div className="flex space-x-2">
                  <button className="text-purple-400 hover:text-purple-600 p-3 hover:bg-purple-100 rounded-full transition-all transform hover:scale-110">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button className="text-orange-500 hover:text-orange-600 p-3 hover:bg-orange-50 rounded-full transition-all transform hover:scale-110">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Assignment Permissions Badge */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                  circle.assignmentPermissions === 'admin-only'
                    ? 'text-red-700 bg-gradient-to-r from-red-100 to-pink-100'
                    : 'text-green-700 bg-gradient-to-r from-green-100 to-emerald-100'
                }`}>
                  {circle.assignmentPermissions === 'admin-only' ? '👑 Boss Mode' : '🤝 Squad Power'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateCircleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}