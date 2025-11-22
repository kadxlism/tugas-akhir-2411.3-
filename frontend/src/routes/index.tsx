import { Navigate } from 'react-router-dom';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import UserList from '@/pages/users/UserList';
import UserForm from '@/pages/users/UserForm';
import Unauthorized from '@/pages/Unauthorized';
import RequireAdmin from '@/components/requireAdmin';
import AddUser from '@/pages/admin/AddUser';
import EditUser from '@/pages/admin/EditUser';
import ClientList from '@/pages/projects/ClientList';
import TaskTable from '@/pages/projects/TaskTable';
import Timeline from '@/pages/Timeline';
import Settings from '@/pages/Settings';
import RequireAuth from '@/components/requireAuth';


const routes = [
  {
    path: '/',
    element: <Navigate to="/login" />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <RequireAdmin>
        <UserList />
      </RequireAdmin>
    ),
  },
  {
    path: '/users',
    element: (
      <RequireAdmin>
        <UserList />
      </RequireAdmin>
    ),
  },
  {
    path: '/users/create',
    element: (
      <RequireAdmin>
        <UserForm />
      </RequireAdmin>
    ),
  },
  {
    path: '/users/:id/edit',
    element: (
      <RequireAdmin>
        <UserForm />
      </RequireAdmin>
    ),
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '/admin/add-user',
    element: (
      <RequireAdmin>
        <AddUser />
      </RequireAdmin>
    ),
  },
  {
    path: '/admin/users/:id/edit',
    element: (
      <RequireAdmin>
        <EditUser />
      </RequireAdmin>
    ),
  },
  // ✅ Client routes
  {
    path: '/clients',
    element: (
      <RequireAuth>
        <ClientList />
      </RequireAuth>
    ),
  },
  {
    path: '/tasks',
    element: (
      <RequireAuth>
        <TaskTable />
      </RequireAuth>
    ),
  },
  {
    path: '/timeline',
    element: (
      <RequireAuth>
        <Timeline />
      </RequireAuth>
    ),
  },
  {
    path: '/settings',
    element: (
      <RequireAuth>
        <Settings />
      </RequireAuth>
    ),
  },
];

export default routes;
