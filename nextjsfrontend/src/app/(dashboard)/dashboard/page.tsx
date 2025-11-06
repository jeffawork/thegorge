'use client';
import { useEffect, useState } from 'react';
import SidePanel from './_component/shared/SidePanel';
import { Header } from './_component/shared/Header';
import { AnimatePresence, motion } from 'framer-motion';
import PageOutlet from './_component/molecules/PageOutlet';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="relative flex h-screen overflow-hidden">
      {
        <div
          className={`overflow-y-auto overflow-x-hidden ${
            collapsed ? 'w-20' : 'w-64'
          } border-r border-gray-800 bg-gray-900/80 shadow-lg backdrop-blur-md`}
        >
          <AnimatePresence>
            <motion.div
              key="sidebar"
              initial={{ x: isMobile ? -260 : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? -260 : 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <SidePanel
                activeTab={activeTab}
                onTabChange={(id) => {
                  setActiveTab(id);
                  if (isMobile) setIsMobileOpen(false); // auto close after selection
                }}
                collapsed={collapsed}
                onMenuToggle={() => {
                  if (isMobile) setIsMobileOpen((prev) => !prev);
                  else setCollapsed((prev) => !prev);
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      }

      <div className="z-5 flex min-h-screen w-full flex-1 flex-col overflow-y-auto">
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
    </section>
  );
};

export default DashboardPage;
