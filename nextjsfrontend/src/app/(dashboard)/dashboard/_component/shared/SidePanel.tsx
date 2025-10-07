import { motion } from 'framer-motion';
import React from 'react';

const sidePanel = ({ activeTab, onTabChange }: ActivePanelProps) => {
  return (
    <motion.aside
      className="fixed left-0 top-0 z-50 h-screen w-64 overflow-y-auto border-r border-gray-700/50 bg-primary/80 backdrop-blur-sm"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      test
    </motion.aside>
  );
};

export default sidePanel;
