import React from 'react';
import { TrendingUp, Target, Users, Trophy } from 'lucide-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useSession } from '~/lib/auth-client';

export function StatsCards() {
  const { data: session } = useSession();
  
  // Get user data
  const userQuery = useSuspenseQuery(
    convexQuery(api.users.getUserByAuthId, {
      authUserId: session?.user?.id || '',
    })
  );

  // Get user's circles
  const circlesQuery = useSuspenseQuery(
    convexQuery(api.circles.getUserCircles, {
      authUserId: session?.user?.id,
    })
  );

  // Get user's yallas
  const yallasQuery = useSuspenseQuery(
    convexQuery(api.yallas.getUserYallas, {
      authUserId: session?.user?.id,
    })
  );

  const user = userQuery.data;
  const circles = circlesQuery.data || [];
  const yallas = yallasQuery.data || [];

  const createdYallas = yallas.filter(y => y.creatorId === session?.user?.id);
  
  const stats = [
    {
      label: 'Vibe Score',
      value: user?.karmaLevel || 0,
      icon: '🔥',
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-yellow-100 to-orange-100',
      change: '+12 fire this week',
    },
    {
      label: 'Yallas Crushed',
      value: user?.tasksCompleted || 0,
      icon: '💪',
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-100 to-emerald-100',
      change: '+5 crushed this week',
    },
    {
      label: 'Squad Count',
      value: circles.length,
      icon: '👥',
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-100 to-pink-100',
      change: '2 new homies',
    },
    {
      label: 'Ideas Dropped',
      value: createdYallas.length,
      icon: '💡',
      color: 'text-pink-600',
      bgColor: 'bg-gradient-to-br from-pink-100 to-rose-100',
      change: '+3 bangers this week',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-white rounded-3xl shadow-xl border-0 p-6 hover:shadow-2xl transition-all transform hover:scale-105 hover:-rotate-1"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-purple-600 mb-1 uppercase tracking-wide">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-purple-500 mt-1 font-medium">{stat.change}</p>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bgColor} shadow-lg transform rotate-12`}>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}