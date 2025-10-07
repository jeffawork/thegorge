'use client';
import { Activity } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';

function AuthPosterImage() {
  return (
    <div>
      <h1>The Gorge</h1>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="blockchain-pulse mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#00FFFF]"
      >
        <Activity className="h-8 w-8" />
      </motion.div>
    </div>
  );
}

export default AuthPosterImage;
