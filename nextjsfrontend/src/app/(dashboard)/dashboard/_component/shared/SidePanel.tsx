'use client';
import { Button } from '@/components/ui/button';
import { navigationItems, settingsItems } from '@/lib/constants';
import { motion } from 'framer-motion';
import {
  Activity,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelRightClose,
  Settings,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const SidePanel = ({
  activeTab,
  onTabChange,
  collapsed,
  onMenuToggle,
}: ActivePanelProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isSettingsActive =
    activeTab.startsWith('settings') ||
    settingsItems.some((item) => activeTab === item.id);

  return (
    <motion.aside
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <section>
        <div className="mb-6 flex items-center justify-center px-3 pt-4 md:items-center md:justify-between md:space-x-3">
          <div className="flex items-center justify-center space-x-4">
            <div className="blockchain-pulse flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#00FFFF]">
              <Activity className="h-4 w-4 text-[#0A0E27]" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-gradient text-lg font-bold">The Gorge</h1>
                <p className="text-xs text-[#B0B3C8]">RPC Monitor</p>
              </div>
            )}
          </div>
          <div
            className="hidden cursor-pointer md:block"
            onClick={onMenuToggle}
          >
            {collapsed ? (
              <PanelRightClose className="h-4 w-4 text-white" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-white" />
            )}
          </div>
        </div>
        <div className="w-fullflex flex-col items-center justify-center space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex w-full items-start rounded-lg px-3 py-2 transition-all duration-200 ${
                  collapsed ? 'justify-start' : 'space-x-3'
                } ${
                  isActive
                    ? 'border border-[#00D4FF]/30 bg-[#00D4FF]/20 text-[#00D4FF]'
                    : 'text-[#B0B3C8] hover:bg-[#1A1D29]/50 hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-[#00D4FF]' : 'text-[#6B7280]'
                  }`}
                />
                {!collapsed && (
                  <span className="hidden text-sm font-medium md:block">
                    {item.label}
                  </span>
                )}
              </motion.button>
            );
          })}

          {/* Settings Dropdown */}
          <div className="mt-2">
            <motion.button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all duration-200 ${
                collapsed ? 'justify-center' : ''
              } ${
                isSettingsActive
                  ? 'border border-[#00D4FF]/30 bg-[#00D4FF]/20 text-[#00D4FF]'
                  : 'text-[#B0B3C8] hover:bg-[#1A1D29]/50 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`flex items-end justify-center space-x-3`}>
                <Settings
                  className={`h-4 w-4 ${
                    isSettingsActive ? 'text-[#00D4FF]' : 'text-[#6B7280]'
                  }`}
                />
                {!collapsed && (
                  <span className="hidden text-sm font-medium md:block">
                    Setting
                  </span>
                )}
              </div>

              {!collapsed &&
                (isSettingsOpen ? (
                  <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                ))}
            </motion.button>
            {/* Settings Sub-items */}
            {/* {!collapsed && ( */}
            <motion.div
              initial={false}
              animate={{
                height: isSettingsOpen ? 'auto' : 0,
                opacity: isSettingsOpen ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-1">
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`flex w-full items-center space-x-3 rounded-lg px-3 py-1.5 text-left transition-all duration-200 ${
                        isActive
                          ? 'border border-[#00D4FF]/30 bg-[#00D4FF]/20 text-[#00D4FF]'
                          : 'text-[#6B7280] hover:bg-[#1A1D29]/50 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {!collapsed && (
                        <span className="hidden text-xs font-medium md:block">
                          {item.label}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
            {/* )} */}
          </div>
        </div>
      </section>
    </motion.aside>
  );
};

export default SidePanel;
