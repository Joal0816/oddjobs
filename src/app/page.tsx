'use client';

import { AppProvider } from '@/context/AppContext';
import MainApp from '@/components/MainApp';

export default function Home() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
