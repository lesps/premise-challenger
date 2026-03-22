import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Capture } from './views/Capture';
import { Triage } from './views/Triage';
import { PressureTest } from './views/PressureTest';
import { Outcome } from './views/Outcome';
import { OpenQuestions } from './views/OpenQuestions';

function App() {
  return (
    <Layout>
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

export default App;
