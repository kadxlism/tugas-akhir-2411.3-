import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";

// Auth pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Unauthorized from "@/pages/Unauthorized";

// Project/Client pages
import ClientList from "@/pages/projects/ClientList";
import ClientForm from "@/pages/projects/ClientForm";
import TaskTable from "@/pages/projects/TaskTable";
import Settings from "@/pages/Settings";

// Admin user mgmt
import UserList from "@/pages/users/UserList";
import UserForm from "@/pages/users/UserForm";

// Time Tracker
import TimeTrackerPage from "@/pages/TimeTracker";
import TaskDetail from "@/pages/TaskDetail";
import TimesheetPage from "@/pages/TimesheetPage";
import Timeline from "@/pages/Timeline";

// Guards
import RequireAuth from "@/components/requireAuth";
import RequireAdmin from "@/components/requireAdmin";

// Layout wrapper
import Layout from "@/components/Layout";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/dashboard" replace />}
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected (any logged-in user) */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout>
              <Dashboard />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Layout>
              <Dashboard />
            </Layout>
          </RequireAuth>
        }
      />

      {/* Admin Pages */}
      <Route
        path="/clients"
        element={
          <RequireAdmin>
            <Layout>
              <ClientList />
            </Layout>
          </RequireAdmin>
        }
      />
      <Route
        path="/clients/new"
        element={
          <RequireAdmin>
            <Layout>
              <ClientForm />
            </Layout>
          </RequireAdmin>
        }
      />
      <Route
        path="/tasks"
        element={
          <RequireAdmin>
            <Layout>
              <TaskTable />
            </Layout>
          </RequireAdmin>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <Layout>
              <Settings />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/time-tracker"
        element={
          <RequireAuth>
            <Layout>
              <TimeTrackerPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/tasks/:taskId"
        element={
          <RequireAuth>
            <Layout>
              <TaskDetail />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/timesheet"
        element={
          <RequireAuth>
            <Layout>
              <TimesheetPage />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/timeline"
        element={
          <RequireAuth>
            <Layout>
              <Timeline />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAdmin>
            <Layout>
              <UserList />
            </Layout>
          </RequireAdmin>
        }
      />
      <Route
        path="/users"
        element={
          <RequireAdmin>
            <Layout>
              <UserList />
            </Layout>
          </RequireAdmin>
        }
      />
      <Route
        path="/users/create"
        element={
          <RequireAdmin>
            <Layout>
              <UserForm />
            </Layout>
          </RequireAdmin>
        }
      />
      <Route
        path="/users/:id/edit"
        element={
          <RequireAdmin>
            <Layout>
              <UserForm />
            </Layout>
          </RequireAdmin>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
