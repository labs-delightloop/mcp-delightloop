import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../styles/globals.css';
import { ContactListView } from './ContactListView';

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

createRoot(container).render(
  <React.StrictMode>
    <ContactListView />
  </React.StrictMode>
);
