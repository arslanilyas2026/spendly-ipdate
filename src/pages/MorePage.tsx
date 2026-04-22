import React from 'react';
import MoreScreen from '@/screens/MoreScreen';
import BottomNav from '@/components/layout/BottomNav';
import { useNavigate } from 'react-router-dom';

export default function MorePage() {
  const navigate = useNavigate();
  return (
    <>
      <MoreScreen />
      <BottomNav onFabPress={() => navigate('/?add=1')} />
    </>
  );
}
