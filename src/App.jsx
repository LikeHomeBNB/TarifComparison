import React from 'react';
import ReactDOM from 'react-dom/client';
import TariffComparisonApp from './TariffComparisonApp';
import './index.css';

function App() {
  return <TariffComparisonApp />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);