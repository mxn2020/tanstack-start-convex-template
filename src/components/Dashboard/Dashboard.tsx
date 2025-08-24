import React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useSession } from '~/lib/auth-client';
import { StatsCards } from './StatsCards';
import { RecentYallas } from './RecentYallas';
import { QuickActions } from './QuickActions';
import { CircleOverview } from './CircleOverview';

export function Dashboard() {
  const { data: session } = useSession();

  // Get user data
  const userQuery = useSuspenseQuery(
    convexQuery(api.users.getUserByAuthId, {
      authUserId: session?.user?.id || '',
    })
  );

  const user = userQuery.data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
          Yalla, {user?.name || session?.user?.name}! 🔥
        </h1>
        <p className="text-xl text-purple-700 font-medium">
          Time to vibe check your squad and crush those goals! ⚡
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <StatsCards />
          <RecentYallas />
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <QuickActions />
          <CircleOverview />
        </div>
      </div>
    </div>
  );
}