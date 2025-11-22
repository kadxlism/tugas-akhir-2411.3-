import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";

const Layout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 text-xl font-bold border-b">Project Manager</div>
        <nav className="mt-4 space-y-2 px-4">
          <Link to="/dashboard" className="block py-2 px-3 rounded hover:bg-gray-200">
            Dashboard
          </Link>
          {user?.role === "admin" && (
            <>
              <Link to="/clients" className="block py-2 px-3 rounded hover:bg-gray-200">
                Clients
              </Link>
              <Link to="/projects" className="block py-2 px-3 rounded hover:bg-gray-200">
                Projects
              </Link>
              <Link to="/tasks" className="block py-2 px-3 rounded hover:bg-gray-200">
                Tasks
              </Link>
              <Link to="/timeline" className="block py-2 px-3 rounded hover:bg-gray-200">
                Timeline
              </Link>
              <Link to="/time-tracker" className="block py-2 px-3 rounded hover:bg-gray-200">
                Time Tracker
              </Link>
              <Link to="/assign" className="block py-2 px-3 rounded hover:bg-gray-200">
                Assign Users
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </header>

        {/* Content */}
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
