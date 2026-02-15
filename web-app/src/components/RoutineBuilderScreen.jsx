import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../SettingsContext';
import { useRoutine, formatRoutineClock } from '../RoutineContext';

export default function RoutineBuilderScreen({ onNavigate }) {
  const { getActiveProfile, getActiveTheme, createRoutine, updateRoutine, deleteRoutine } = useSettings();
  const { startRoutine } = useRoutine();
  
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [routineName, setRoutineName] = useState('');
  const [routineEmoji, setRoutineEmoji] = useState('📋');
  const [steps, setSteps] = useState([]);
  const [showStepEditor, setShowStepEditor] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [stepMinutes, setStepMinutes] = useState(5);
  const [stepName, setStepName] = useState('');
  
  const firstButtonRef = useRef(null);
  const profile = getActiveProfile();
  const currentTheme = getActiveTheme();
  
  const emojis = ['📋', '🌅', '🍳', '📚', '🧹', '🚿', '👕', '🎮', '🛏️', '🏃', '✏️', '🎵', '💪', '🎨', '📱'];

  useEffect(() => {
    if (firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, []);

  const handleAddStep = () => {
    setEditingStepIndex(null);
    setStepMinutes(5);
    setStepName('');
    setShowStepEditor(true);
  };

  const handleEditStep = (index) => {
    const step = steps[index];
    setEditingStepIndex(index);
    setStepMinutes(step.minutes);
    setStepName(step.name || '');
    setShowStepEditor(true);
  };

  const handleSaveStep = () => {
    const newStep = {
      minutes: stepMinutes,
      name: stepName.trim() || formatStepName(stepMinutes),
    };
    
    if (editingStepIndex !== null) {
      const newSteps = [...steps];
      newSteps[editingStepIndex] = newStep;
      setSteps(newSteps);
    } else {
      setSteps([...steps, newStep]);
    }
    
    setShowStepEditor(false);
    setStepMinutes(5);
    setStepName('');
    setEditingStepIndex(null);
  };

  const handleDeleteStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleMoveStep = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;
    
    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const formatStepName = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const handleSaveRoutine = () => {
    if (!routineName.trim() || steps.length === 0) return;
    
    if (editingRoutine) {
      updateRoutine(editingRoutine.id, {
        name: routineName.trim(),
        emoji: routineEmoji,
        steps: steps,
      });
    } else {
      createRoutine(routineName.trim(), routineEmoji, steps);
    }
    
    // Reset form
    setEditingRoutine(null);
    setRoutineName('');
    setRoutineEmoji('📋');
    setSteps([]);
  };

  const handleStartRoutine = (routine) => {
    startRoutine(routine);
    onNavigate('runningRoutine');
  };

  const handleEditExistingRoutine = (routine) => {
    setEditingRoutine(routine);
    setRoutineName(routine.name);
    setRoutineEmoji(routine.emoji);
    setSteps([...routine.steps]);
  };

  const handleDeleteExistingRoutine = (routineId) => {
    deleteRoutine(routineId);
  };

  const handleCancelEdit = () => {
    setEditingRoutine(null);
    setRoutineName('');
    setRoutineEmoji('📋');
    setSteps([]);
  };

  const adjustStepMinutes = (delta) => {
    setStepMinutes(Math.max(1, Math.min(180, stepMinutes + delta)));
  };

  const getTotalTime = () => {
    return steps.reduce((total, step) => total + step.minutes, 0);
  };

  // If editing/creating a routine
  if (editingRoutine || routineName || steps.length > 0) {
    return (
      <div 
        className="min-h-screen flex flex-col p-8"
        style={{ background: currentTheme.gradients.running }}
      >
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleCancelEdit}
              className="btn-preset bg-gray-700 hover:bg-gray-600 text-xl px-6 py-3"
            >
              ← Cancel
            </button>
            <h1 className="text-4xl font-bold text-white">
              {editingRoutine ? 'Edit Routine' : 'New Routine'}
            </h1>
            <button
              onClick={handleSaveRoutine}
              disabled={!routineName.trim() || steps.length === 0}
              className="btn-preset bg-green-600 hover:bg-green-500 text-xl px-6 py-3 disabled:opacity-50"
            >
              Save
            </button>
          </div>
          
          {/* Routine Name */}
          <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setRoutineEmoji(emoji)}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      routineEmoji === emoji 
                        ? 'bg-white/20 scale-125' 
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="flex-1 text-2xl p-4 rounded-xl bg-gray-900/50 text-white border-2 border-gray-600 focus:border-white outline-none"
                placeholder="Routine name..."
              />
            </div>
          </div>
          
          {/* Steps */}
          <div className="flex-1 overflow-auto">
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Steps</h2>
                <button
                  onClick={handleAddStep}
                  className="btn-preset bg-blue-600 hover:bg-blue-500 text-xl px-6 py-2"
                >
                  + Add Step
                </button>
              </div>
              
              {steps.length === 0 ? (
                <p className="text-xl text-gray-500 text-center py-8">
                  No steps yet. Add your first step!
                </p>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 bg-gray-900/50 rounded-xl p-4"
                    >
                      <span className="text-2xl text-gray-500 w-8">{index + 1}.</span>
                      <span className="text-3xl font-mono text-white w-24">
                        {formatStepName(step.minutes)}
                      </span>
                      <span className="text-xl text-white flex-1">{step.name}</span>
                      
                      {/* Move buttons */}
                      <button
                        onClick={() => handleMoveStep(index, -1)}
                        disabled={index === 0}
                        className="text-2xl p-2 rounded-lg hover:bg-gray-700 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveStep(index, 1)}
                        disabled={index === steps.length - 1}
                        className="text-2xl p-2 rounded-lg hover:bg-gray-700 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      
                      <button
                        onClick={() => handleEditStep(index)}
                        className="text-2xl p-2 rounded-lg hover:bg-gray-700 text-blue-400"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteStep(index)}
                        className="text-2xl p-2 rounded-lg hover:bg-gray-700 text-red-400"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {steps.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <p className="text-xl text-gray-400 text-center">
                    Total time: <span className="text-white font-bold">{getTotalTime()} minutes</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Step Editor Modal */}
        {showStepEditor && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && setShowStepEditor(false)}
          >
            <div 
              className="rounded-2xl p-8 max-w-lg w-full mx-4 animate-fade-in"
              style={{ background: currentTheme.gradients.running }}
            >
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                {editingStepIndex !== null ? 'Edit Step' : 'Add Step'}
              </h2>
              
              {/* Duration */}
              <div className="mb-6">
                <label className="block text-lg text-gray-400 mb-3">Duration</label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => adjustStepMinutes(-5)}
                    className="btn-preset bg-red-600 hover:bg-red-500 text-2xl px-6 py-4"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => adjustStepMinutes(-1)}
                    className="btn-preset bg-red-700 hover:bg-red-600 text-2xl px-4 py-4"
                  >
                    -1
                  </button>
                  <div className="text-5xl font-mono font-bold text-white w-32 text-center">
                    {formatStepName(stepMinutes)}
                  </div>
                  <button
                    onClick={() => adjustStepMinutes(1)}
                    className="btn-preset bg-green-700 hover:bg-green-600 text-2xl px-4 py-4"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => adjustStepMinutes(5)}
                    className="btn-preset bg-green-600 hover:bg-green-500 text-2xl px-6 py-4"
                  >
                    +5
                  </button>
                </div>
              </div>
              
              {/* Quick values */}
              <div className="flex justify-center gap-2 flex-wrap mb-6">
                {[1, 2, 3, 5, 10, 15, 20, 30, 45, 60].map((val) => (
                  <button
                    key={val}
                    onClick={() => setStepMinutes(val)}
                    className={`px-3 py-1 rounded-lg text-lg ${
                      stepMinutes === val 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {val}m
                  </button>
                ))}
              </div>
              
              {/* Name */}
              <div className="mb-8">
                <label className="block text-lg text-gray-400 mb-2">Activity Name (optional)</label>
                <input
                  type="text"
                  value={stepName}
                  onChange={(e) => setStepName(e.target.value)}
                  className="w-full text-2xl p-4 rounded-xl bg-gray-900/50 text-white border-2 border-gray-600 focus:border-white outline-none"
                  placeholder="e.g., Brush teeth, Tidy room..."
                />
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleSaveStep}
                  className="btn-preset bg-green-600 hover:bg-green-500 text-xl px-8 py-4"
                >
                  {editingStepIndex !== null ? 'Update' : 'Add'}
                </button>
                <button
                  onClick={() => setShowStepEditor(false)}
                  className="btn-preset bg-gray-700 hover:bg-gray-600 text-xl px-8 py-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main view - list of routines
  return (
    <div 
      className="min-h-screen flex flex-col p-8"
      style={{ background: currentTheme.gradients.running }}
    >
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            ref={firstButtonRef}
            onClick={() => onNavigate('presets')}
            className="btn-preset bg-gray-700 hover:bg-gray-600 text-xl px-6 py-3"
          >
            ← Back
          </button>
          <h1 className="text-5xl font-bold text-white">Routines</h1>
          <button
            onClick={() => setEditingRoutine({})}
            className="btn-preset bg-green-600 hover:bg-green-500 text-xl px-6 py-3"
          >
            + New
          </button>
        </div>
        
        {/* Routines List */}
        {profile?.routines?.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-8xl mb-6">📋</div>
            <h2 className="text-3xl font-bold text-white mb-4">No Routines Yet</h2>
            <p className="text-xl text-gray-400 mb-8 text-center">
              Create a routine to chain multiple timers together.<br/>
              Great for bedtime routines, morning schedules, and more!
            </p>
            <button
              onClick={() => setEditingRoutine({})}
              className="btn-preset bg-green-600 hover:bg-green-500 text-2xl px-12 py-6"
            >
              Create Your First Routine
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile?.routines?.map((routine) => (
              <div 
                key={routine.id}
                className="bg-gray-800/50 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{routine.emoji}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{routine.name}</h3>
                      <p className="text-gray-400">
                        {routine.steps.length} steps • {routine.steps.reduce((t, s) => t + s.minutes, 0)} min total
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Steps preview */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {routine.steps.slice(0, 4).map((step, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 rounded-full bg-gray-700 text-white text-sm"
                    >
                      {step.minutes}m
                    </span>
                  ))}
                  {routine.steps.length > 4 && (
                    <span className="px-3 py-1 rounded-full bg-gray-700 text-gray-400 text-sm">
                      +{routine.steps.length - 4} more
                    </span>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartRoutine(routine)}
                    className="btn-preset flex-1 bg-green-600 hover:bg-green-500 text-xl py-3"
                  >
                    ▶ Start
                  </button>
                  <button
                    onClick={() => handleEditExistingRoutine(routine)}
                    className="btn-preset bg-gray-700 hover:bg-gray-600 text-xl px-4 py-3"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteExistingRoutine(routine.id)}
                    className="btn-preset bg-red-700 hover:bg-red-600 text-xl px-4 py-3"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center text-lg text-gray-500 mt-8">
          <p>Routines run timers in sequence automatically</p>
        </div>
      </div>
    </div>
  );
}
