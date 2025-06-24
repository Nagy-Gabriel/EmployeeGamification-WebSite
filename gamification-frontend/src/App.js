import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
//import Tasks from './pages/Tasks';
import Dashboard from './pages/Dashboard';
import TeamManagement from './pages/TeamManagement';
import TaskManagement from './pages/TaskManagement';
import TaskPrioritiesStatus from './pages/TaskPrioritiesStatus';
import BadgesPoints from './pages/BadgesPoints';
import Projects from './pages/Projects';
import WorkSchedule from './pages/WorkSchedule';
import AbsenceCalendar from './pages/AbsenceCalendar';
import Reports from './pages/Reports';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './pages/AdminPanel';
import Quests from './pages/Quests';
import AskAi from './pages/AskAi';
import NotificationsTab from './pages/NotificationsTab';
import QuizPage from './pages/QuizPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team-management"
          element={
            <ProtectedRoute>
              <TeamManagement />
            </ProtectedRoute>
          }
        />
          <Route
          path="/ask-ai"
          element={
            <ProtectedRoute>
              <AskAi/>
            </ProtectedRoute>
          }
        />
             <Route
          path="/notification-tab"
          element={
            <ProtectedRoute>
              <NotificationsTab/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-priorities-status"
          element={
            <ProtectedRoute>
              <TaskPrioritiesStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/badges-points"
          element={
            <ProtectedRoute>
              <BadgesPoints />
            </ProtectedRoute>
          }
        />
        <Route path="/admin-panel" element={
            <ProtectedRoute>
               <AdminPanel />
             </ProtectedRoute>
        } />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/work-schedule"
          element={
            <ProtectedRoute>
              <WorkSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/absence-calendar"
          element={
            <ProtectedRoute>
              <AbsenceCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quests"
          element={
            <ProtectedRoute>
              <Quests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;