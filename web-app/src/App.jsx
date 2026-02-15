import { useState, useEffect } from 'react';
import { TimerProvider, useTimer } from './TimerContext';
import { SettingsProvider, useSettings } from './SettingsContext';
import { RoutineProvider } from './RoutineContext';
import PresetsScreen from './components/PresetsScreen';
import CustomScreen from './components/CustomScreen';
import RunningScreen from './components/RunningScreen';
import SettingsScreen from './components/SettingsScreen';
import ProfileSwitcher from './components/ProfileSwitcher';
import RoutineBuilderScreen from './components/RoutineBuilderScreen';
import RunningRoutineScreen from './components/RunningRoutineScreen';
import './index.css';

function AppContent() {
  const [screen, setScreen] = useState('presets');
  const { state: timerState } = useTimer();
  const { state: settingsState, toggleProfileSwitcher } = useSettings();

  // Auto-navigate to running when single timer starts
  useEffect(() => {
    if (timerState.phase !== 'IDLE' && screen !== 'running' && screen !== 'runningRoutine') {
      setScreen('running');
    }
  }, [timerState.phase, screen]);

  // Handle profile switcher toggle from anywhere
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Long press P or special combo to open profile switcher
      if (e.key === 'p' && e.ctrlKey) {
        toggleProfileSwitcher();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleProfileSwitcher]);

  const renderScreen = () => {
    switch (screen) {
      case 'presets':
        return <PresetsScreen onNavigate={setScreen} />;
      case 'custom':
        return <CustomScreen onNavigate={setScreen} />;
      case 'running':
        return <RunningScreen onNavigate={setScreen} />;
      case 'settings':
        return <SettingsScreen onNavigate={setScreen} />;
      case 'routines':
        return <RoutineBuilderScreen onNavigate={setScreen} />;
      case 'runningRoutine':
        return <RunningRoutineScreen onNavigate={setScreen} />;
      default:
        return <PresetsScreen onNavigate={setScreen} />;
    }
  };

  return (
    <>
      {renderScreen()}
      {settingsState.showProfileSwitcher && (
        <ProfileSwitcher onClose={toggleProfileSwitcher} />
      )}
    </>
  );
}

function App() {
  return (
    <SettingsProvider>
      <RoutineProvider>
        <TimerProvider>
          <AppContent />
        </TimerProvider>
      </RoutineProvider>
    </SettingsProvider>
  );
}

export default App;
