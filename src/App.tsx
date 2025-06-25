import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth stores
import { useAuthStore } from './store/authStore';

// Auth pages
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Dashboard layout and pages
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { QuestsPage } from './pages/quests/QuestsPage';
import { NewQuestPage } from './pages/quests/NewQuestPage';
import { SkillsPage } from './pages/skills/SkillsPage';
import { AchievementsPage } from './pages/achievements/AchievementsPage';
import { TitlesPage } from './pages/titles/TitlesPage';
import { ProfilePage } from './pages/profile/ProfilePage';

function App() {
  const { initialize, loading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading LifeLeveler...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />

          {/* Protected routes */}
          <Route path="/app" element={<DashboardLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="quests" element={<QuestsPage />} />
            <Route path="quests/new" element={<NewQuestPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="titles" element={<TitlesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </Router>
  );
}

export default App;