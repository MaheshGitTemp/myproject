import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Stylesheet order matches the original HTML pages:
// font-awesome -> fonts -> main.css -> page CSS (imported by the pages inside App) -> tailwind LAST.
// Tailwind must stay last so its utilities override .glass / page rules exactly as before.
import './assets/vendor/fontawesome/css/all.min.css';
import './styles/fonts.css';
import './styles/main.css';

import App from './App.jsx';

import './styles/tailwind.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
