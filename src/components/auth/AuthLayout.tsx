// src/components/auth/AuthLayout.tsx

import React from 'react';
import { Brain, ArrowRight } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative z-10 text-center max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-4xl font-bold text-white">Geenius</h1>
              <p className="text-indigo-200 text-sm">Smart Task Management</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6 text-left">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Intelligent Organization</h3>
                <p className="text-indigo-200 text-sm">Smart kanban boards that adapt to your workflow and help you stay focused on what matters most.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Real-time Collaboration</h3>
                <p className="text-indigo-200 text-sm">Work seamlessly with your team with instant updates and smart notifications.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Productivity Insights</h3>
                <p className="text-indigo-200 text-sm">Get intelligent insights into your productivity patterns and optimize your workflow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-gray-900">Geenius</h1>
              <p className="text-gray-500 text-sm">Smart Task Management</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {children}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Secure authentication powered by industry standards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}