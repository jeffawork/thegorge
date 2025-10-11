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

  // useEffect hook to detect screen size for responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // return (
  //   <section className="flex min-h-screen overflow-x-hidden bg-gray-950 text-gray-200">
  //     {/* ✅ SIDEPANEL */}
  //     <AnimatePresence>
  //       {(isMobileOpen || !isMobile) && (
  //         <motion.div
  //           key="sidebar"
  //           initial={{ x: isMobile ? -260 : 0, opacity: 0 }}
  //           animate={{ x: 0, opacity: 1 }}
  //           exit={{ x: isMobile ? -260 : 0, opacity: 0 }}
  //           transition={{ duration: 0.4 }}
  //           className={`fixed z-50 md:static ${
  //             collapsed ? 'w-20' : 'w-64'
  //           } h-screen border-r border-gray-800 bg-gray-900/90 shadow-lg backdrop-blur-md transition-all duration-300`}
  //         >
  //           <SidePanel
  //             activeTab={activeTab}
  //             onTabChange={(id) => {
  //               setActiveTab(id);
  //               if (isMobile) setIsMobileOpen(false);
  //             }}
  //             collapsed={collapsed}
  //           />
  //         </motion.div>
  //       )}
  //     </AnimatePresence>

  //     {/* ✅ MAIN AREA */}
  //     <div className="relative z-10 flex min-h-screen w-full flex-col transition-all duration-300">
  //       <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900/60 px-4 py-3 backdrop-blur-md">
  //         {/* Toggle button (mobile or desktop) */}
  //         <button
  //           onClick={() =>
  //             isMobile
  //               ? setIsMobileOpen((prev) => !prev)
  //               : setCollapsed((prev) => !prev)
  //           }
  //           className="rounded-lg p-2 transition hover:bg-gray-800/70"
  //         >
  //           {isMobile ? (
  //             <Menu className="h-5 w-5 text-gray-400" />
  //           ) : collapsed ? (
  //             <PanelRightClose className="h-5 w-5 text-gray-400" />
  //           ) : (
  //             <PanelLeftClose className="h-5 w-5 text-gray-400" />
  //           )}
  //         </button>

  //         {/* Reuse your header */}
  //         <Header />
  //       </header>

  //       <main className="container mx-auto flex-1 px-4 py-6">
  //         <motion.div
  //           initial={{ opacity: 0, y: 20 }}
  //           animate={{ opacity: 1, y: 0 }}
  //           transition={{ duration: 0.6 }}
  //         >
  //           <PageOutlet activeTab={activeTab} />
  //         </motion.div>
  //       </main>
  //     </div>

  //     {/* ✅ BACKDROP for mobile drawer */}
  //     <AnimatePresence>
  //       {isMobileOpen && (
  //         <motion.div
  //           key="backdrop"
  //           initial={{ opacity: 0 }}
  //           animate={{ opacity: 0.5 }}
  //           exit={{ opacity: 0 }}
  //           transition={{ duration: 0.3 }}
  //           className="fixed inset-0 z-40 bg-black md:hidden"
  //           onClick={() => setIsMobileOpen(false)}
  //         />
  //       )}
  //     </AnimatePresence>
  //   </section>
  // );

  return (
    <section className="flex min-h-screen overflow-hidden">
      <AnimatePresence>
        {(isMobileOpen || !isMobile) && (
          <motion.div
            key="sidebar"
            initial={{ x: isMobile ? -260 : 0, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? -260 : 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`fixed z-50 md:static ${
              collapsed ? 'w-20' : 'w-64'
            } h-screen border-r border-gray-800 bg-gray-900/80 shadow-lg backdrop-blur-md`}
          >
            <SidePanel
              activeTab={activeTab}
              onTabChange={(id) => {
                setActiveTab(id);
                if (isMobile) setIsMobileOpen(false); // auto close after selection
              }}
              collapsed={collapsed}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <Header
          collapsed={collapsed}
          onMenuToggle={() => {
            if (isMobile) setIsMobileOpen((prev) => !prev);
            else setCollapsed((prev) => !prev);
          }}
        />
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
