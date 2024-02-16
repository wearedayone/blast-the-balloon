import { Routes, Route, Navigate } from 'react-router-dom';

import App from '../pages/App';

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/app" element={<App />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
};

export default MainRoutes;
