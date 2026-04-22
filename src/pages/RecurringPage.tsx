import React from 'react';
import RecurringScreen from '@/screens/RecurringScreen';
import BottomNav from '@/components/layout/BottomNav';

export default function RecurringPage() {
  return (
    <>
      <RecurringScreen />
      <BottomNav onFabPress={() => {}} />
    </>
  );
}
