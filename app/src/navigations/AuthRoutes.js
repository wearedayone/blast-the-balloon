import { Routes, Route, Navigate } from 'react-router-dom';

import Home from '../pages/Home';

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/:refCode" element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AuthRoutes;
