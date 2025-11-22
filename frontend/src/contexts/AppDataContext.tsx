import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/useAuth";

export type Client = { 
  id: number; 
  company_name: string; 
  owner: string; 
  phone: string; 
  package: string; 
  deadline: string; 
  dp: string; 
  category: string; 
  created_at: string;
  updated_at: string;
};
export type User = { id: number; name: string; email: string };
export type Project = {
  created_at: string; id: number; name: string; clientId: number 
};
export type Task = {
  id: number;
  project_id?: number;
  title: string;
  paket?: string | null;
  description: string | null;
  assigned_to: number | null;
  due_date: string | null;
  status: "todo" | "in_progress" | "review" | "done";
  priority?: "low" | "medium" | "high";
  assignee?: { id: number; name: string; role: string } | null;
  category?: string | null;
  created_at?: string;
  updated_at?: string;
};
export type Assignment = { userId: number; projectId: number };
export type TimeLog = { id: number; taskId: number; userId: number; minutes: number; date: string };

type AppData = {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  timeLogs: TimeLog[];
  setTimeLogs: React.Dispatch<React.SetStateAction<TimeLog[]>>;
};

const AppDataContext = createContext<AppData | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const { addNotification } = useNotification();
  const { user } = useAuth();

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load tasks
    const storedTasks = localStorage.getItem('tasks_data');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error parsing stored tasks:', error);
      }
    }

    // Load clients
    const storedClients = localStorage.getItem('clients_data');
    if (storedClients) {
      try {
        const parsedClients = JSON.parse(storedClients);
        setClients(parsedClients);
      } catch (error) {
        console.error('Error parsing stored clients:', error);
      }
    }

    // Load projects
    const storedProjects = localStorage.getItem('projects_data');
    if (storedProjects) {
      try {
        const parsedProjects = JSON.parse(storedProjects);
        setProjects(parsedProjects);
      } catch (error) {
        console.error('Error parsing stored projects:', error);
      }
    }

    // Load users
    const storedUsers = localStorage.getItem('users_data');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        setUsers(parsedUsers);
      } catch (error) {
        console.error('Error parsing stored users:', error);
      }
    }
  }, []);

  // Saat user login atau tasks berubah pertama kali, buat notifikasi untuk tugas yang ditugaskan ke user
  useEffect(() => {
    if (!user) return;
    const unreadFlagKey = `notif_seeded_for_user_${user.id}`;
    if (localStorage.getItem(unreadFlagKey)) return; // hindari duplikasi tiap reload
    const assignedToMe = tasks.filter(t => (t as any).assigned_to === user.id);
    if (assignedToMe.length > 0) {
      addNotification(`Anda memiliki ${assignedToMe.length} tugas yang ditugaskan`, '/tasks');
      localStorage.setItem(unreadFlagKey, '1');
    }
  }, [user, tasks]);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('tasks_data', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('clients_data', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('projects_data', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('users_data', JSON.stringify(users));
  }, [users]);

  return (
    <AppDataContext.Provider
      value={{
        clients, setClients,
        users, setUsers,
        projects, setProjects,
        tasks, setTasks,
        assignments, setAssignments,
        timeLogs, setTimeLogs,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
};
