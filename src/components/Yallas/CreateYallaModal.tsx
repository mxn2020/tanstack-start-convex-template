import React, { useState } from 'react';
import { X, Users, Vote, Calendar, User } from 'lucide-react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useConvexMutation, convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useSession } from '~/lib/auth-client';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateYallaModal({ isOpen, onClose }: Props) {
  const { data: session } = useSession();
  
  // Get user's circles
  const circlesQuery = useSuspenseQuery(
    convexQuery(api.circles.getUserCircles, {
      authUserId: session?.user?.id,
    })
  );
  
  const circles = circlesQuery.data || [];
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'community' as 'community' | 'assigned',
    circleId: circles[0]?.id || '',
    assignedTo: [] as string[],
    dueDate: '',
  });

  const createYallaMutation = useMutation({
    mutationFn: useConvexMutation(api.yallas.createYalla),
    onSuccess: () => {
      toast.success('Yalla created successfully! 🎉');
      setFormData({
        title: '',
        description: '',
        type: 'community',
        circleId: circles[0]?.id || '',
        assignedTo: [],
        dueDate: '',
      });
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to create yalla. Please try again.');
      console.error('Failed to create yalla:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error('You must be logged in to create a yalla');
      return;
    }

    createYallaMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      type: formData.type,
      creatorId: session.user.id,
      circleId: formData.circleId,
      assignedTo: formData.type === 'assigned' ? formData.assignedTo : undefined,
      priority: 1,
      dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
    });
  };

  const selectedCircle = circles.find(c => c.id === formData.circleId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Yalla</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Yalla Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Yalla Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  formData.type === 'community'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="community"
                  checked={formData.type === 'community'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="sr-only"
                />
                <div className="flex items-center mb-2">
                  <Vote className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="font-medium text-gray-900">Community Yalla</span>
                </div>
                <p className="text-sm text-gray-600">
                  Let your circle vote on the priority of this task
                </p>
              </label>
              
              <label
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  formData.type === 'assigned'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="assigned"
                  checked={formData.type === 'assigned'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="sr-only"
                />
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="font-medium text-gray-900">Assigned Yalla</span>
                </div>
                <p className="text-sm text-gray-600">
                  Assign this task to specific circle members
                </p>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="What needs to be done?"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Add more details about this task..."
            />
          </div>

          {/* Circle Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-2" />
              Circle
            </label>
            <select
              value={formData.circleId}
              onChange={(e) => setFormData({ ...formData, circleId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              {circles.map((circle) => (
                <option key={circle.id} value={circle.id}>
                  {circle.name} ({circle.members.length} members)
                </option>
              ))}
            </select>
          </div>

          {/* Assignment (for assigned yallas) */}
          {formData.type === 'assigned' && selectedCircle && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
                {selectedCircle.members.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No members in this circle yet. Add members to assign tasks.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedCircle.members.map((member) => (
                      <label key={member.authUserId} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.assignedTo.includes(member.authUserId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                assignedTo: [...formData.assignedTo, member.authUserId],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                assignedTo: formData.assignedTo.filter(id => id !== member.authUserId),
                              });
                            }
                          }}
                          className="mr-3 text-orange-500"
                        />
                        <span className="text-sm text-gray-900">{member.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createYallaMutation.isPending || !formData.title || !formData.circleId || (formData.type === 'assigned' && formData.assignedTo.length === 0)}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {createYallaMutation.isPending ? 'Creating...' : 'Create Yalla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}