'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Plus,
  RefreshCw,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
// import { useRPC } from '../contexts/RPCContext'
// import { useAuth } from '../contexts/AuthContext'
// import { AddRPCModal } from './AddRPCModal'

export const Header = () => {
  // const { user, logout } = useAuth()
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  return (
    <motion.header
      className="glass-card mb-8 p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            className="blockchain-pulse rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#00FFFF] p-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart3 className="h-8 w-8 text-[#0A0E27]" />
          </motion.div>

          <div>
            <motion.h1
              className="text-gradient text-3xl font-bold lg:text-4xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              The Gorge
            </motion.h1>
            <motion.p
              className="text-sm text-[#B0B3C8] lg:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Real-time blockchain infrastructure monitoring
            </motion.p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            className="glass-button flex items-center gap-2 px-4 py-2 text-sm font-medium"
            // onClick={handleRefresh}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </motion.button>

          <motion.button
            className="btn-primary flex items-center gap-2 px-6 py-2"
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-4 w-4" />
            Add RPC
          </motion.button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              className="glass-button flex items-center gap-2 px-3 py-2 text-sm font-medium"
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )} */}
              {/* <span className="hidden sm:block">{user?.name || 'User'}</span> */}
            </motion.button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card absolute right-0 z-50 mt-2 w-48 p-2"
              >
                <div className="border-b border-gray-700/50 px-3 py-2">
                  {/* <p className="text-sm font-medium text-white">{user?.name || 'User'}</p> */}
                  {/* <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p> */}
                </div>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800/50"
                  onClick={() => {
                    setShowUserMenu(false);
                    // Navigate to settings profile
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20"
                  onClick={() => {
                    // logout()
                    setShowUserMenu(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
