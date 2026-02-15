import { useState } from 'react';
import { TimerProvider, useTimer } from './TimerContext';
import PresetsScreen from './components/PresetsScreen';
import CustomScreen from './components/CustomScreen';
import RunningScreen from './components/RunningScreen';
import './index.css';

function AppContent() {
  const [screen, setScreen] = useState('presets');
  const { state } = useTimer();

  // Auto-navigate to running when timer starts
  if (state.phase !== 'IDLE' && screen !== 'running') {
    setScreen('running');
  }

  const renderScreen = () => {
    switch (screen) {
      case 'presets':
        return <PresetsScreen onNavigate={setScreen} />;
      case 'custom':
        return <CustomScreen onNavigate={setScreen} />;
      case 'running':
        return <RunningScreen onNavigate={setScreen} />;
      default:
        return <PresetsScreen onNavigate={setScreen} />;
    }
  };

  return renderScreen();
}

function App() {
  return (
    <TimerProvider>
      <AppContent />
    </TimerProvider>
  );
}

export default App;
