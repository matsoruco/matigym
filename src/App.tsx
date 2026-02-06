import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { WorkoutView } from './pages/WorkoutView';
import { EditRoutine } from './pages/EditRoutine';
import { MyWorkout } from './pages/MyWorkout';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workout/:dayNumber" element={<WorkoutView />} />
        <Route path="/edit-routine" element={<EditRoutine />} />
        <Route path="/my-workout" element={<MyWorkout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
