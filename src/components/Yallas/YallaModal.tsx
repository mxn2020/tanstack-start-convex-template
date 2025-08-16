import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown, Camera, CheckCircle, Clock, Users, User, Calendar, Upload, Image as ImageIcon } from 'lucide-react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useConvexMutation, convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useSession } from '~/lib/auth-client';
import { Yalla } from '~/types';
import toast from 'react-hot-toast';
import { useNotificationHelpers } from '~/hooks/useNotifications';
import { ConvexImage } from '~/components/ui/ConvexImage';

interface Props {
  yalla: Yalla | null;
  isOpen: boolean;
  onClose: () => void;
}

export function YallaModal({ yalla, isOpen, onClose }: Props) {
  const { data: session } = useSession();
  const { notifyVote, notifyCompletion } = useNotificationHelpers();
  const [completionImage, setCompletionImage] = useState<File | null>(null);
  const [completionImagePreview, setCompletionImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Get user's circles to find the circle for this yalla
  const circlesQuery = useSuspenseQuery(
    convexQuery(api.circles.getUserCircles, {
      authUserId: session?.user?.id,
    })
  );

  const generateUploadUrlMutation = useMutation({
    mutationFn: useConvexMutation(api.yallas.generateUploadUrl),
  });

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
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to update yalla. Please try again.');
      console.error('Failed to update yalla:', error);
    },
  });

  if (!isOpen || !yalla) return null;

  const circles = circlesQuery.data || [];
  const circle = circles.find(c => c.id === yalla.circleId);
  const isOwner = yalla.creatorId === session?.user?.id;
  const isAssignedToUser = yalla.assignedTo?.includes(session?.user?.id || '');
  const canComplete = isOwner || isAssignedToUser;

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCompletionImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompletionImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setShowImageUpload(false);
    }
  };

  const handleComplete = async (withImage: boolean = false) => {
    if (!session?.user?.id) return;

    setIsUploading(true);
    
    try {
      let completionImageUrl: string | undefined;
      
      if (withImage && completionImage) {
        // Generate upload URL
        const postUrl = await generateUploadUrlMutation.mutateAsync({});
        
        // Upload image to Convex
        const result = await fetch(postUrl, {
          method: 'POST',
          headers: { 'Content-Type': completionImage.type },
          body: completionImage,
        });
        
        const { storageId } = await result.json();
        
        // Get the URL for the uploaded image
        completionImageUrl = storageId;
      }

      // Update yalla with completion data
      await updateYallaMutation.mutateAsync({
        id: yalla.id,
        status: 'completed' as const,
        completedAt: Date.now(),
        completionImage: completionImageUrl,
        authUserId: session.user.id,
      });

      // Trigger notification for completion
      if (session.user.name) {
        notifyCompletion(yalla.id, session.user.id, session.user.name, yalla.title);
      }
    } catch (error) {
      console.error('Failed to complete yalla:', error);
      toast.error('Failed to complete yalla. Please try again.');
    } finally {
      setIsUploading(false);
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <User className="h-5 w-5 text-blue-500" />;
      default:
        return <Users className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (yalla.status) {
      case 'completed':
        return 'text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 border-green-200';
      case 'pending':
        return 'text-yellow-700 bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-200';
      case 'accepted':
        return 'text-blue-700 bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200';
      case 'declined':
        return 'text-red-700 bg-gradient-to-r from-red-100 to-pink-100 border-red-200';
      default:
        return 'text-gray-700 bg-gradient-to-r from-gray-100 to-slate-100 border-gray-200';
    }
  };

  const voteCount = getVoteCount();
  const userVote = getUserVote();
  const isOverdue = yalla.dueDate && new Date(yalla.dueDate) < new Date() && yalla.status !== 'completed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-6 rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-black border-2 ${
                    yalla.type === 'community'
                      ? 'text-purple-800 bg-white border-purple-200'
                      : 'text-orange-800 bg-white border-orange-200'
                  }`}
                >
                  {yalla.type === 'community' ? '🗳️ Squad Vote' : '⚡ Mission'}
                </span>
                
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-black border-2 bg-white ${getStatusColor()}`}
                >
                  {getStatusIcon()}
                  <span className="ml-2 capitalize">{yalla.status}</span>
                </span>
              </div>
              
              <h2 className="text-3xl font-black text-white mb-2">{yalla.title}</h2>
              
              <div className="flex items-center space-x-4 text-white/90 text-sm font-medium">
                <span className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2 border-2 border-white"
                    style={{ backgroundColor: circle?.color || '#6366F1' }}
                  ></div>
                  {circle?.name}
                </span>
                <span>{new Date(yalla.createdAt).toLocaleDateString()}</span>
                {yalla.dueDate && (
                  <span className={`flex items-center font-bold ${isOverdue ? 'text-red-200' : 'text-yellow-200'}`}>
                    <Calendar className="h-4 w-4 mr-1" />
                    Due: {new Date(yalla.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-full transition-all transform hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          {yalla.description && (
            <div className="mb-6">
              <h3 className="text-lg font-black text-purple-700 mb-3">What's the vibe? 💭</h3>
              <p className="text-purple-600 text-lg font-medium leading-relaxed bg-purple-50 p-4 rounded-2xl">
                {yalla.description}
              </p>
            </div>
          )}

          {/* Voting Section for Community Yallas */}
          {yalla.type === 'community' && (
            <div className="mb-6">
              <h3 className="text-lg font-black text-purple-700 mb-4">Squad Says 🗳️</h3>
              <div className="flex items-center justify-center space-x-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
                <button
                  onClick={() => handleVote(1)}
                  disabled={yalla.status === 'completed'}
                  className={`p-4 rounded-2xl transition-all transform hover:scale-110 ${
                    yalla.status === 'completed'
                      ? 'text-gray-300 cursor-not-allowed'
                      : userVote === 1
                      ? 'text-green-600 bg-gradient-to-r from-green-100 to-emerald-100 shadow-lg scale-110'
                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <ChevronUp className="h-8 w-8" />
                </button>
                
                <div className="text-center">
                  <div className={`text-4xl font-black ${
                    voteCount > 0 ? 'text-green-600' : voteCount < 0 ? 'text-red-600' : 'text-purple-600'
                  }`}>
                    {voteCount}
                  </div>
                  <div className="text-sm font-bold text-purple-500 uppercase tracking-wide">
                    {voteCount === 1 ? 'vibe' : 'vibes'}
                  </div>
                </div>
                
                <button
                  onClick={() => handleVote(-1)}
                  disabled={yalla.status === 'completed'}
                  className={`p-4 rounded-2xl transition-all transform hover:scale-110 ${
                    yalla.status === 'completed'
                      ? 'text-gray-300 cursor-not-allowed'
                      : userVote === -1
                      ? 'text-red-600 bg-gradient-to-r from-red-100 to-pink-100 shadow-lg scale-110'
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <ChevronDown className="h-8 w-8" />
                </button>
              </div>
            </div>
          )}

          {/* Completion Section for Owners/Assignees */}
          {canComplete && yalla.status !== 'completed' && (
            <div className="mb-6">
              <h3 className="text-lg font-black text-purple-700 mb-4">
                {isOwner ? 'Crush this yalla! 💪' : 'Ready to complete? 🎯'}
              </h3>
              
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border-2 border-orange-200">
                {!showImageUpload && !completionImagePreview ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowImageUpload(true)}
                      className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-300 hover:to-pink-400 text-white px-6 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    >
                      <Camera className="h-5 w-5" />
                      <span>Add Proof & Complete 📸</span>
                    </button>
                    
                    <button
                      onClick={() => handleComplete(false)}
                      disabled={isUploading}
                      className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-300 hover:to-emerald-400 text-white px-6 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>{isUploading ? 'Completing...' : 'Mark Complete (No Photo) ✅'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {showImageUpload && (
                      <div className="border-2 border-dashed border-orange-300 rounded-2xl p-8 text-center">
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 text-orange-400 mx-auto" />
                          <div>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                              <span className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-300 hover:to-pink-400 text-white px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg inline-flex items-center space-x-2">
                                <ImageIcon className="h-4 w-4" />
                                <span>Choose Photo 📷</span>
                              </span>
                            </label>
                          </div>
                          <p className="text-orange-600 font-medium">Show off your completed yalla! 💪</p>
                        </div>
                      </div>
                    )}

                    {completionImagePreview && (
                      <div className="space-y-4">
                        <img
                          src={completionImagePreview}
                          alt="Completion proof"
                          className="max-w-full h-48 object-cover rounded-2xl mx-auto shadow-lg"
                        />
                        <p className="text-green-600 font-bold text-center">Looking fire! 🔥</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowImageUpload(false);
                          setCompletionImage(null);
                          setCompletionImagePreview(null);
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-2xl font-bold transition-all"
                      >
                        Cancel
                      </button>
                      
                      {completionImagePreview && (
                        <button
                          onClick={() => handleComplete(true)}
                          disabled={isUploading}
                          className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-300 hover:to-emerald-400 text-white px-4 py-3 rounded-2xl font-black transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
                        >
                          {isUploading ? 'Uploading...' : 'Complete with Photo! 🎉'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons for Assigned Yallas */}
          {yalla.type === 'assigned' && yalla.assignedTo?.includes(session?.user?.id || '') && yalla.status === 'pending' && (
            <div className="mb-6">
              <h3 className="text-lg font-black text-purple-700 mb-4">What's the move? 🤔</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleStatusChange('accepted')}
                  className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-300 hover:to-cyan-400 text-white px-6 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  I'm on it! 🚀
                </button>
                <button
                  onClick={() => handleStatusChange('declined')}
                  className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-300 hover:to-gray-400 text-white px-6 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  Pass 😅
                </button>
              </div>
            </div>
          )}

          {/* Completion Display */}
          {yalla.status === 'completed' && yalla.completedAt && (
            <div className="mb-6">
              <h3 className="text-lg font-black text-green-700 mb-4">Yalla Crushed! 🎉</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                {yalla.completionImage && (
                  <ConvexImage
                    storageId={yalla.completionImage}
                    alt="Completion proof"
                    className="w-full h-48 object-cover rounded-2xl mb-4 shadow-lg"
                    fallback={
                      <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-gray-500">Image not found</span>
                      </div>
                    }
                  />
                )}
                <div className="text-center">
                  <div className="text-6xl mb-2">🏆</div>
                  <p className="text-green-700 font-black text-xl">
                    Completed {new Date(yalla.completedAt).toLocaleDateString()}
                  </p>
                  <p className="text-green-600 font-medium mt-2">
                    Another one bites the dust! Keep crushing those goals! 💪
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}