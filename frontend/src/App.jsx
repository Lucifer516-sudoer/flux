import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import AddTradePage from './pages/AddTradePage';

import JournalPage from './pages/JournalPage';

import AnalyticsPage from './pages/AnalyticsPage';

const SettingsPage = () => <div className="p-4"><h1 className="text-2xl font-bold text-highlight">Settings</h1><p className="text-neutral-text mt-4">Future settings will be configured here.</p></div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* The Analytics page is the home page */}
        <Route index element={<AnalyticsPage />} />
        <Route path="add" element={<AddTradePage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
