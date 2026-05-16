import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../styles/globals.css';
import { ContactCardView } from './ContactCardView';

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

createRoot(container).render(
  <React.StrictMode>
    <ContactCardView />
  </React.StrictMode>
);
