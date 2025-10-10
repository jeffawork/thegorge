'use client';
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Plus,
  RefreshCw,
  User,
  LogOut,
  Settings,
  PanelRightClose,
  PanelLeftClose,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { useRPC } from '../contexts/RPCContext'
// import { useAuth } from '../contexts/AuthContext'
// import { AddRPCModal } from './AddRPCModal'
interface HeaderProps {
  onMenuToggle: () => void;
  collapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, collapsed }) => {
  // const { user, logout } = useAuth()
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  return (
    <motion.header
      className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-gray-800 bg-gray-900/70 px-4 py-3 backdrop-blur-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Left Section — Menu + Brand */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <Button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-gray-300 transition hover:bg-gray-800 hover:text-white"
        >
          {collapsed ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>

        {/* Logo + Title */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.03 }}
        >
          <BarChart3 className="hidden h-8 w-8 text-cyan-400 md:block" />
          <div>
            <h1 className="text-gradient text-xl font-bold lg:text-2xl">
              The Gorge
            </h1>
            <p className="text-xs text-gray-400 lg:text-sm">
              Real-time blockchain infrastructure monitoring
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Section — Actions */}
      <div className="flex items-center gap-3">
        <motion.button
          className="glass-button flex items-center gap-2 px-3 py-2 text-sm font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </motion.button>

        <motion.button
          className="btn-primary flex items-center gap-2 px-4 py-2"
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
            <User className="h-5 w-5" />
          </motion.button>

          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card absolute right-0 z-50 mt-2 w-48 p-2"
            >
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                onClick={() => setShowUserMenu(false)}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};
