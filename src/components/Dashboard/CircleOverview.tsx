import React from 'react';
import { Users, Plus } from 'lucide-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useSession } from '~/lib/auth-client';

export function CircleOverview() {
  const { data: session } = useSession();

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

  const circles = circlesQuery.data || [];
  const yallas = yallasQuery.data || [];

  return (
    <div className="bg-white rounded-3xl shadow-xl border-0 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black text-purple-600 uppercase tracking-wide">Your Squad 💫</h3>
        <button className="text-orange-500 hover:text-orange-600 p-2 hover:bg-orange-50 rounded-full transition-all transform hover:scale-110">
          <Plus className="h-6 w-6" />
        </button>
      </div>
      
      <div className="space-y-3">
        {circles.map((circle) => (
          <div
            key={circle.id}
            className="flex items-center justify-between p-4 rounded-2xl border-2 border-purple-100 hover:shadow-lg transition-all transform hover:scale-[1.02] bg-gradient-to-r from-white to-purple-50"
          >
            <div className="flex items-center">
              <div
                className="w-5 h-5 rounded-full mr-3 shadow-sm"
                style={{ backgroundColor: circle.color }}
              ></div>
              <div>
                <div className="font-bold text-gray-900">{circle.name}</div>
                <div className="text-sm text-purple-500 flex items-center font-medium">
                  <Users className="h-3 w-3 mr-1" />
                  {circle.members.length} homies
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-black text-purple-600">
                {yallas.filter(y => y.circleId === circle.id).length}
              </div>
              <div className="text-xs text-purple-400 font-bold uppercase">drops</div>
            </div>
          </div>
        ))}
        
        {circles.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-purple-500 text-sm font-medium">No squad yet, bestie!</p>
            <button className="text-orange-500 hover:text-orange-600 text-sm mt-2 font-bold">
              Build your first squad 🔥
            </button>
          </div>
        )}
      </div>
    </div>
  );
}