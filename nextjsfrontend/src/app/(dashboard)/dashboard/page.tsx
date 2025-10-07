'use client';
import { useState } from 'react';
import SidePanel from './_component/shared/SidePanel';
import { Header } from './_component/shared/Header';
import { motion } from 'framer-motion';
import PageOutlet from './_component/molecules/PageOutlet';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <main>
      <SidePanel activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="relative z-10 ml-64 flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto flex-1 px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PageOutlet activeTab={activeTab} />
          </motion.div>
        </main>
      </div>
    </main>
  );
};

export default DashboardPage;
