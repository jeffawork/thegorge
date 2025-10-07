import { navigationItems, settingsItems } from '@/lib/constants';
import { motion } from 'framer-motion';
import { Activity, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import React, { useState } from 'react';

const sidePanel = ({ activeTab, onTabChange }: ActivePanelProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isSettingsActive =
    activeTab.startsWith('settings') ||
    settingsItems.some((item) => activeTab === item.id);

  return (
    <motion.aside
      className="fixed left-0 top-0 z-50 h-screen w-64 overflow-y-auto border-r border-gray-700/50 bg-primary/80 backdrop-blur-sm"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <section>
        <div className="mb-6 flex items-center space-x-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="blockchain-pulse mx-auto mb-4 flex h-7 w-7 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#00FFFF]"
          >
            <Activity className="h-8 w-8" />
          </motion.div>
          <div>
            <h1 className="text-gradient text-lg font-bold">The Gorge</h1>
            <p className="text-xs text-primary-foreground/45">RPC Monitor</p>
          </div>
        </div>
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-left transition-all duration-200 ${
                  isActive
                    ? 'border border-[#00D4FF]/30 bg-[#00D4FF]/20 text-[#00D4FF]'
                    : 'text-[#B0B3C8] hover:bg-[#1A1D29]/50 hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? 'text-[#00D4FF]' : 'text-[#6B7280]'}`}
                />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00D4FF]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            );
          })}

          {/* Settings Dropdown */}
          <div className="mt-2">
            <motion.button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-all duration-200 ${
                isSettingsActive
                  ? 'border border-[#00D4FF]/30 bg-[#00D4FF]/20 text-[#00D4FF]'
                  : 'text-[#B0B3C8] hover:bg-[#1A1D29]/50 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <Settings
                  className={`h-4 w-4 ${isSettingsActive ? 'text-[#00D4FF]' : 'text-[#6B7280]'}`}
                />
                <span className="text-sm font-medium">Settings</span>
              </div>
              {isSettingsOpen ? (
                <ChevronDown className="h-4 w-4 text-[#6B7280]" />
              ) : (
                <ChevronRight className="h-4 w-4 text-[#6B7280]" />
              )}
            </motion.button>

            {/* Settings Sub-items */}
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
                      <Icon
                        className={`h-3.5 w-3.5 ${isActive ? 'text-[#00D4FF]' : 'text-[#6B7280]'}`}
                      />
                      <span className="text-xs font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          className="ml-auto h-1 w-1 rounded-full bg-[#00D4FF]"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.aside>
  );
};

export default sidePanel;
