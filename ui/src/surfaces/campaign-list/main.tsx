import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../styles/globals.css';
import { CampaignListView } from './CampaignListView';

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

createRoot(container).render(
  <React.StrictMode>
    <CampaignListView />
  </React.StrictMode>
);
