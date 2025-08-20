import React from 'react'
import { motion } from 'framer-motion'
import { StatusOverview } from '../components/StatusOverview'
import { RPCList } from '../components/RPCList'
import { AlertsList } from '../components/AlertsList'

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Status Overview */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <StatusOverview />
      </motion.section>

      {/* RPC List */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <RPCList />
      </motion.section>

      {/* Alerts */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <AlertsList />
      </motion.section>
    </div>
  )
}
