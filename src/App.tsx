import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { WorkoutView } from './pages/WorkoutView';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workout/:dayNumber" element={<WorkoutView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
