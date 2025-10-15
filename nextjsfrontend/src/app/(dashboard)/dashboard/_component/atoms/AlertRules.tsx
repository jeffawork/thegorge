import { AlertTriangle, Info } from 'lucide-react';
import React from 'react';

export const AlertRules = () => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Alert Rules</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-gray-800/30 p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <div className="font-medium text-white">High Response Time</div>
                <div className="text-sm text-gray-400">
                  Alert when response time &gt; 5s
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                Active
              </span>
              <button className="text-blue-400 hover:text-blue-300">
                Edit
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-800/30 p-4">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-yellow-400" />
              <div>
                <div className="font-medium text-white">Low Balance</div>
                <div className="text-sm text-gray-400">
                  Alert when wallet balance &lt; 0.1 ETH
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                Active
              </span>
              <button className="text-blue-400 hover:text-blue-300">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
