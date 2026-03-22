import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Dashboard</div>} />
      <Route path="/new" element={<div>Capture</div>} />
      <Route path="/triage/:id" element={<div>Triage</div>} />
      <Route path="/test/:id" element={<div>Pressure Test</div>} />
      <Route path="/outcome/:id" element={<div>Outcome</div>} />
      <Route path="/open-questions" element={<div>Open Questions</div>} />
    </Routes>
  );
}

export default App;
