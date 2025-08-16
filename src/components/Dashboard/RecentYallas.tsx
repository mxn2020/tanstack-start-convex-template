import React from 'react';
import { ChevronUp, ChevronDown, Clock, CheckCircle, Users } from 'lucide-react';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useSession } from '~/lib/auth-client';
import { Yalla } from '../../types';
import toast from 'react-hot-toast';

export function RecentYallas() {
  const { data: session } = useSession();
  
  // Get user's yallas
  const yallasQuery = useSuspenseQuery(
    convexQuery(api.yallas.getUserYallas, {
      authUserId: session?.user?.id,
    })
  );

  // Get user's circles for circle info
  const circlesQuery = useSuspenseQuery(
    convexQuery(api.circles.getUserCircles, {
      authUserId: session?.user?.id,
    })
  );

  const allYallas = yallasQuery.data || [];
  const circles = circlesQuery.data || [];

  // Transform and sort yallas
  const recentYallas = allYallas
    .map(yalla => ({
      ...yalla,
      createdAt: new Date(yalla.createdAt),
      updatedAt: new Date(yalla.updatedAt),
      dueDate: yalla.dueDate ? new Date(yalla.dueDate) : undefined,
      completedAt: yalla.completedAt ? new Date(yalla.completedAt) : undefined,
      votes: yalla.votes.map(vote => ({
        ...vote,
        createdAt: new Date(vote.createdAt),
      })),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  const voteOnYallaMutation = useMutation({
    mutationFn: useConvexMutation(api.yallas.voteOnYalla),
    onError: (error) => {
      toast.error('Failed to vote. Please try again.');
      console.error('Failed to vote:', error);
    },
  });

  const handleVote = (yallaId: string, value: number) => {
    if (!session?.user?.id) return;
    
    voteOnYallaMutation.mutate({
      yallaId,
      userId: session.user.id,
      value,
    });
  };

  const getVoteCount = (yalla: Yalla) => {
    return yalla.votes.reduce((sum, vote) => sum + vote.value, 0);
  };

  const getUserVote = (yalla: Yalla) => {
    if (!session?.user?.id) return 0;
    const userVote = yalla.votes.find(vote => vote.userId === session.user!.id);
    return userVote?.value || 0;
  };

  const getStatusIcon = (yalla: Yalla) => {
    switch (yalla.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Users className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (yalla: Yalla) => {
    switch (yalla.status) {
      case 'completed':
        return 'text-green-700 bg-green-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'accepted':
        return 'text-blue-700 bg-blue-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-0 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500">
        <h2 className="text-2xl font-black text-white">Latest Drops 🎯</h2>
        <p className="text-purple-100 text-sm mt-1 font-medium">Your freshest yallas and squad vibes</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {recentYallas.map((yalla) => {
            const circle = circles.find(c => c.id === yalla.circleId);
            const voteCount = getVoteCount(yalla);
            const userVote = getUserVote(yalla);
            
            return (
              <div
                key={yalla.id}
                className="border-2 border-purple-100 rounded-2xl p-5 hover:shadow-lg transition-all transform hover:scale-[1.02] bg-gradient-to-r from-white to-purple-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{yalla.title}</h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(yalla)}`}
                      >
                        {getStatusIcon(yalla)}
                        <span className="ml-1 capitalize">{yalla.status}</span>
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          yalla.type === 'community'
                            ? 'text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100'
                            : 'text-orange-700 bg-gradient-to-r from-orange-100 to-yellow-100'
                        }`}
                      >
                        {yalla.type === 'community' ? '🔥 Squad Vote' : '⚡ Mission'}
                      </span>
                    </div>
                    
                    {yalla.description && (
                      <p className="text-purple-600 text-sm mb-3 font-medium">{yalla.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-purple-500 font-medium">
                      <span className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2 shadow-sm"
                          style={{ backgroundColor: circle?.color || '#6366F1' }}
                        ></div>
                        {circle?.name}
                      </span>
                      <span>{new Date(yalla.createdAt).toLocaleDateString()}</span>
                      {yalla.dueDate && (
                        <span className="text-orange-600 font-bold">
                          Due: {new Date(yalla.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Voting Section for Community Yallas */}
                  {yalla.type === 'community' && (
                    <div className="flex flex-col items-center ml-4 bg-white rounded-2xl p-3 shadow-lg">
                      <button
                        onClick={() => handleVote(yalla.id, 1)}
                        className={`p-2 rounded-xl transition-all transform hover:scale-110 ${
                          userVote === 1
                            ? 'text-green-600 bg-gradient-to-r from-green-100 to-emerald-100 shadow-md'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <ChevronUp className="h-5 w-5" />
                      </button>
                      
                      <span className={`text-lg font-black ${
                        voteCount > 0 ? 'text-green-600' : voteCount < 0 ? 'text-red-600' : 'text-purple-600'
                      }`}>
                        {voteCount}
                      </span>
                      
                      <button
                        onClick={() => handleVote(yalla.id, -1)}
                        className={`p-2 rounded-xl transition-all transform hover:scale-110 ${
                          userVote === -1
                            ? 'text-red-600 bg-gradient-to-r from-red-100 to-pink-100 shadow-md'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {recentYallas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">🚀</div>
            <h3 className="text-2xl font-black text-purple-600 mb-2">No drops yet, bestie!</h3>
            <p className="text-purple-500 mb-6 font-medium">Time to drop your first yalla and get the squad hyped!</p>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg font-bold text-lg">
              Drop Your First Yalla 🔥
            </button>
          </div>
        )}
      </div>
    </div>
  );
}