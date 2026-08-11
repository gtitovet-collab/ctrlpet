import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { AdMob } from '@capacitor-community/admob';
import App from './App.tsx';
import './index.css';

// Initialize AdMob early before rendering the app
if (Capacitor.isNativePlatform()) {
  AdMob.initialize({
    initializeForTesting: true,
    testingDevices: ['4f9bf358-ed97-4c9f-a687-77fc3c5dfeba'], // Samsung A22
  }).catch(err => console.error('Error initializing AdMob:', err));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
