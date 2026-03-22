import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StorageProvider, StorageContext } from './context/StorageContext';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Capture } from './views/Capture';
import { Triage } from './views/Triage';
import { PressureTest } from './views/PressureTest';
import { Outcome } from './views/Outcome';
import { OpenQuestions } from './views/OpenQuestions';

function StorageBanners() {
  const { storageAvailable, quotaExceeded, setQuotaExceeded } = useContext(StorageContext);

  const bannerStyle: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-sans)',
    lineHeight: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  };

  return (
    <>
      {!storageAvailable && (
        <div
          role="alert"
          style={{
            ...bannerStyle,
            background: '#2a2010',
            color: '#c9a84c',
            borderBottom: '1px solid #3a3010',
          }}
        >
          <span>Private browsing detected. Your data won't be saved between sessions.</span>
        </div>
      )}
      {quotaExceeded && (
        <div
          role="alert"
          style={{
            ...bannerStyle,
            background: '#2a1010',
            color: '#c97c5c',
            borderBottom: '1px solid #3a1010',
          }}
        >
          <span>Storage full. Export your data and clear old propositions.</span>
          <button
            type="button"
            aria-label="Dismiss storage warning"
            onClick={() => setQuotaExceeded(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0 4px',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

function AppRoutes() {
  return (
    <Layout banner={<StorageBanners />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<Capture />} />
        <Route path="/triage/:id" element={<Triage />} />
        <Route path="/test/:id" element={<PressureTest />} />
        <Route path="/outcome/:id" element={<Outcome />} />
        <Route path="/open-questions" element={<OpenQuestions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <StorageProvider>
      <AppRoutes />
    </StorageProvider>
  );
}

export default App;
