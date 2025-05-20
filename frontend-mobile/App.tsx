import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { Navigation } from './src/navigation';

export default function App() {
  return (
    <PaperProvider>
      <Navigation />
    </PaperProvider>
  );
}
