import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { RoleGate } from './components/RoleGate.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { PayoutCreatePage } from './pages/PayoutCreatePage.jsx';
import { PayoutDetailPage } from './pages/PayoutDetailPage.jsx';
import { PayoutsPage } from './pages/PayoutsPage.jsx';
import { VendorsPage } from './pages/VendorsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/vendors"
        element={
          <ProtectedRoute>
            <VendorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payouts"
        element={
          <ProtectedRoute>
            <PayoutsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payouts/new"
        element={
          <ProtectedRoute>
            <RoleGate roles={['OPS']}>
              <PayoutCreatePage />
            </RoleGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payouts/:id"
        element={
          <ProtectedRoute>
            <PayoutDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/payouts" replace />} />
      <Route path="*" element={<Navigate to="/payouts" replace />} />
    </Routes>
  );
}
