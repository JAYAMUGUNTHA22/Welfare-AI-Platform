import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n.js';
import { loadSchemeCatalogTranslations } from './utils/schemeCatalogTranslations.js';

const savedLanguage = localStorage.getItem('userLanguage') || localStorage.getItem('i18nextLng') || 'English';
loadSchemeCatalogTranslations(savedLanguage).finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
