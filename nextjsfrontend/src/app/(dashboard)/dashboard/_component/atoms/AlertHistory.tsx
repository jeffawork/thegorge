import { AlertTriangle, Info } from 'lucide-react';

export const AlertHistory = () => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Alert History</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-gray-800/30 p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <div className="font-medium text-white">
                  RPC Response Time High
                </div>
                <div className="text-sm text-gray-400">
                  Ethereum Mainnet • 2 hours ago
                </div>
              </div>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
              Resolved
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-800/30 p-4">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-yellow-400" />
              <div>
                <div className="font-medium text-white">Wallet Balance Low</div>
                <div className="text-sm text-gray-400">
                  0x1234...5678 • 4 hours ago
                </div>
              </div>
            </div>
            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
              Pending
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
