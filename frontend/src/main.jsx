import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import i18n from './i18n.js';
import { loadSchemeCatalogTranslations } from './utils/schemeCatalogTranslations.js';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// The full scheme catalog can be large. Render the interface immediately and
// refresh it once translations for the saved language are available.
void loadSchemeCatalogTranslations(i18n.language).then(() => {
  i18n.emit('languageChanged', i18n.language);
});
