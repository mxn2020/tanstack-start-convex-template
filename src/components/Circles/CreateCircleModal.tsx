import React, { useState } from 'react';
import { X, Palette } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useConvexMutation } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useSession } from '~/lib/auth-client';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const colorOptions = [
  '#FF6B35', '#6366F1', '#14B8A6', '#8B5CF6', '#EF4444', '#F59E0B',
  '#10B981', '#3B82F6', '#EC4899', '#84CC16', '#F97316', '#6D28D9'
];

export function CreateCircleModal({ isOpen, onClose }: Props) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: colorOptions[0],
    assignmentPermissions: 'all-members' as 'admin-only' | 'all-members',
  });

  const createCircleMutation = useMutation({
    mutationFn: useConvexMutation(api.circles.createCircle),
    onSuccess: () => {
      toast.success('Circle created successfully! 🎉');
      setFormData({
        name: '',
        description: '',
        color: colorOptions[0],
        assignmentPermissions: 'all-members',
      });
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to create circle. Please try again.');
      console.error('Failed to create circle:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error('You must be logged in to create a circle');
      return;
    }

    createCircleMutation.mutate({
      name: formData.name,
      description: formData.description,
      color: formData.color,
      adminId: session.user.id,
      assignmentPermissions: formData.assignmentPermissions,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Circle</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Circle Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Family, Work Squad, Book Club"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="What's this circle for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="h-4 w-4 inline mr-2" />
              Circle Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who can assign tasks?
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="assignmentPermissions"
                  value="all-members"
                  checked={formData.assignmentPermissions === 'all-members'}
                  onChange={(e) => setFormData({ ...formData, assignmentPermissions: e.target.value as any })}
                  className="mr-3 text-orange-500"
                />
                <span className="text-sm text-gray-900">All members can assign tasks</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="assignmentPermissions"
                  value="admin-only"
                  checked={formData.assignmentPermissions === 'admin-only'}
                  onChange={(e) => setFormData({ ...formData, assignmentPermissions: e.target.value as any })}
                  className="mr-3 text-orange-500"
                />
                <span className="text-sm text-gray-900">Only admins can assign tasks</span>
              </label>
            </div>
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
              disabled={createCircleMutation.isPending}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors"
            >
              {createCircleMutation.isPending ? 'Creating...' : 'Create Circle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

