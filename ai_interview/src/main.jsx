import React from 'react';
import ReactDOM from 'react-dom/client';
// ✅ 1. Make sure the import includes the '.jsx' extension
import App from './App.jsx'; 
import './index.css';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  // ✅ 2. Wrap everything in <React.StrictMode> for best practices
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);