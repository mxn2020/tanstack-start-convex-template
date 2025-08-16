import React from 'react';
import { ChevronUp, ChevronDown, Clock, CheckCircle, Users, User, Calendar, Eye } from 'lucide-react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useConvexMutation, convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useSession } from '~/lib/auth-client';
import { Yalla } from '../../types';
import toast from 'react-hot-toast';
import { useNotificationHelpers } from '~/hooks/useNotifications';

interface Props {
  yalla: Yalla;
  onViewDetails: (yalla: Yalla) => void;
}

export function YallaCard({ yalla, onViewDetails }: Props) {
  const { data: session } = useSession();
  const { notifyVote, notifyCompletion } = useNotificationHelpers();
  
  // Get user's circles to find the circle for this yalla
  const circlesQuery = useSuspenseQuery(
    convexQuery(api.circles.getUserCircles, {
      authUserId: session?.user?.id,
    })
  );
  
  const circles = circlesQuery.data || [];
  const circle = circles.find(c => c.id === yalla.circleId);

  const voteOnYallaMutation = useMutation({
    mutationFn: useConvexMutation(api.yallas.voteOnYalla),
    onError: (error) => {
      toast.error('Failed to vote. Please try again.');
      console.error('Failed to vote:', error);
    },
  });

  const updateYallaMutation = useMutation({
    mutationFn: useConvexMutation(api.yallas.updateYalla),
    onSuccess: () => {
      toast.success('Yalla updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update yalla. Please try again.');
      console.error('Failed to update yalla:', error);
    },
  });
  
  const handleVote = (value: number) => {
    if (!session?.user?.id || yalla.status === 'completed') return;
    
    voteOnYallaMutation.mutate({
      yallaId: yalla.id,
      userId: session.user.id,
      value,
    });

    // Trigger notification for vote
    if (session.user.name) {
      notifyVote(yalla.id, session.user.id, session.user.name, yalla.title);
    }
  };

  const handleStatusChange = (newStatus: Yalla['status']) => {
    if (!session?.user?.id) return;

    updateYallaMutation.mutate({
      id: yalla.id,
      status: newStatus,
      completedAt: newStatus === 'completed' ? Date.now() : undefined,
      authUserId: session.user.id,
    });

    // Trigger notification for completion
    if (newStatus === 'completed' && session.user.name) {
      notifyCompletion(yalla.id, session.user.id, session.user.name, yalla.title);
    }
  };

  const getVoteCount = () => {
    return yalla.votes.reduce((sum, vote) => sum + vote.value, 0);
  };

  const getUserVote = () => {
    if (!session?.user?.id) return 0;
    const userVote = yalla.votes.find(vote => vote.userId === session.user!.id);
    return userVote?.value || 0;
  };

  const getStatusIcon = () => {
    switch (yalla.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <User className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (yalla.status) {
      case 'completed':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'accepted':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'declined':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const voteCount = getVoteCount();
  const userVote = getUserVote();
  const isOverdue = yalla.dueDate && new Date(yalla.dueDate) < new Date() && yalla.status !== 'completed';

  return (
    <div className={`bg-white rounded-3xl shadow-xl border-0 hover:shadow-2xl transition-all transform hover:scale-105 hover:-rotate-1 ${
      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-black ${
                  yalla.type === 'community'
                    ? 'text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200'
                    : 'text-orange-700 bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-200'
                }`}
              >
                {yalla.type === 'community' ? '🗳️ Squad Vote' : '⚡ Mission'}
              </span>
              
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-black border-2 ${getStatusColor()}`}
              >
                {getStatusIcon()}
                <span className="ml-1 capitalize">{yalla.status}</span>
              </span>
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 mb-3">{yalla.title}</h3>
            
            {yalla.description && (
              <p className="text-purple-600 text-lg font-medium mb-4 line-clamp-2">{yalla.description}</p>
            )}
          </div>
          
          {/* Voting for Community Yallas */}
          {yalla.type === 'community' && (
            <div className="flex flex-col items-center ml-6 bg-white rounded-2xl p-4 shadow-lg">
              <button
                onClick={() => handleVote(1)}
                disabled={yalla.status === 'completed'}
                className={`p-3 rounded-xl transition-all transform hover:scale-110 ${
                  yalla.status === 'completed'
                    ? 'text-gray-300 cursor-not-allowed'
                    : userVote === 1
                    ? 'text-green-600 bg-gradient-to-r from-green-100 to-emerald-100 shadow-md'
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <ChevronUp className="h-6 w-6" />
              </button>
              
              <span className={`text-xl font-black py-2 ${
                voteCount > 0 ? 'text-green-600' : voteCount < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {voteCount}
              </span>
              
              <button
                onClick={() => handleVote(-1)}
                disabled={yalla.status === 'completed'}
                className={`p-3 rounded-xl transition-all transform hover:scale-110 ${
                  yalla.status === 'completed'
                    ? 'text-gray-300 cursor-not-allowed'
                    : userVote === -1
                    ? 'text-red-600 bg-gradient-to-r from-red-100 to-pink-100 shadow-md'
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <ChevronDown className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        {/* Circle and Date Info */}
        <div className="flex items-center justify-between text-lg text-purple-500 font-medium mb-6">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2 shadow-sm"
                style={{ backgroundColor: circle?.color || '#6366F1' }}
              ></div>
              {circle?.name}
            </span>
            
            <span>{new Date(yalla.createdAt).toLocaleDateString()}</span>
          </div>
          
          {yalla.dueDate && (
            <span className={`flex items-center font-bold ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
              <Calendar className="h-4 w-4 mr-1" />
              Due: {new Date(yalla.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* View Details Button */}
        <div className="mb-4">
          <button
            onClick={() => onViewDetails(yalla)}
            className="w-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 px-6 py-3 rounded-2xl font-black text-lg transition-all transform hover:scale-105 border-2 border-purple-200 flex items-center justify-center space-x-2"
          >
            <Eye className="h-5 w-5" />
            <span>View Details 👀</span>
          </button>
        </div>

        {/* Action Buttons for Assigned Yallas */}
        {yalla.type === 'assigned' && yalla.assignedTo?.includes(session?.user?.id || '') && (
          <div className="border-t-2 border-purple-100 pt-6">
            <div className="flex space-x-2">
              {yalla.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange('accepted')}
                    className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-300 hover:to-cyan-400 text-white px-4 py-3 rounded-2xl font-black transition-all transform hover:scale-105 shadow-lg"
                  >
                    I'm on it! 🚀
                  </button>
                  <button
                    onClick={() => handleStatusChange('declined')}
                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-300 hover:to-gray-400 text-white px-4 py-3 rounded-2xl font-black transition-all transform hover:scale-105 shadow-lg"
                  >
                    Pass 😅
                  </button>
                </>
              )}
              
              {yalla.status === 'accepted' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-300 hover:to-emerald-400 text-white px-4 py-3 rounded-2xl font-black transition-all transform hover:scale-105 shadow-lg"
                >
                  Crush It! 💪
                </button>
              )}
              
              {yalla.status === 'completed' && yalla.completedAt && (
                <div className="w-full text-center text-green-600 font-black text-lg py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border-2 border-green-200">
                  🏆 Crushed {new Date(yalla.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}