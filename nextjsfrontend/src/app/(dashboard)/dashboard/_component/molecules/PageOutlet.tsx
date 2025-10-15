import React from 'react';
import OverviewDisplay from './OverviewDisplay';
import AlertsDisplay from './AlertsDisplay';
import AnalyticsDisplay from './AnalyticsDisplay';
import AnomaliesDisplay from './AnomaliesDisplay';
import SettingsDisplay from './SettingsDisplay';
import RPCSyncDisplay from './RPCSyncDisplay';
import WalletPorfolioDisplay from './WalletPorfolioDisplay';
import UsageAndCosts from './UsageAndCosts';

interface Props {
  activeTab: string;
}

const PageOutlet = ({ activeTab }: Props) => {
  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDisplay />;
      case 'rpc-sync':
        return <RPCSyncDisplay />;
      case 'portfolio':
        return <WalletPorfolioDisplay />;
      case 'alerts':
        return <AlertsDisplay />;
      case 'performance':
        return <AnalyticsDisplay />;
      case 'usage-costs':
        return <UsageAndCosts />;
      case 'anomalies':
        return <AnomaliesDisplay />;
      case 'general':
      case 'profile':
      case 'notifications':
      case 'security':
      case 'data-privacy':
      case 'appearance':
      case 'team':
      case 'billing':
        return <SettingsDisplay />;
      default:
        return <OverviewDisplay />;
    }
  };

  const result = renderPage();

  return result;
};

export default PageOutlet;
