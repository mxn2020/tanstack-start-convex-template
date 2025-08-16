import React, { useState } from 'react';
import { Plus, Users, Target, Zap } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { CreateYallaModal } from '../Yallas/CreateYallaModal';
import { CreateCircleModal } from '../Circles/CreateCircleModal';

export function QuickActions() {
  const navigate = useNavigate();
  const [showYallaModal, setShowYallaModal] = useState(false);
  const [showCircleModal, setShowCircleModal] = useState(false);

  const actions = [
    {
      label: 'Drop a Yalla',
      icon: Plus,
      description: 'Drop some fire for your squad to vote on',
      color: 'bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-300 hover:to-pink-400',
      action: () => setShowYallaModal(true),
    },
    {
      label: 'Build Squad',
      icon: Users,
      description: 'Gather your homies for epic collabs',
      color: 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400',
      action: () => setShowCircleModal(true),
    },
    {
      label: 'View All Yallas',
      icon: Zap,
      description: 'Check out all your squad drops',
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400',
      action: () => navigate({ to: '/yallas' }),
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border-0 p-6">
      <h3 className="text-xl font-black text-purple-600 mb-6 uppercase tracking-wide">Quick Vibes ⚡</h3>
      
      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.action}
            className={`w-full text-left p-5 rounded-2xl ${action.color} text-white transition-all transform hover:scale-105 shadow-lg group`}
          >
            <div className="flex items-center">
              <action.icon className="h-6 w-6 mr-4" />
              <div>
                <div className="font-black text-lg">{action.label}</div>
                <div className="text-sm opacity-90 mt-1 font-medium">{action.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Modals */}
      <CreateYallaModal
        isOpen={showYallaModal}
        onClose={() => setShowYallaModal(false)}
      />
      <CreateCircleModal
        isOpen={showCircleModal}
        onClose={() => setShowCircleModal(false)}
      />
    </div>
  );
}