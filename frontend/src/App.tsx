import React from 'react';
import './styles/globals.css';
import { GamePage } from './pages/GamePage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <GamePage />
    </ErrorBoundary>
  );
}

export default App;