
import { useState, useEffect, useCallback } from "react";
import { useTimeStore } from '@/stores/timeStore';
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/useAuth";
import { getTasks, createTask, updateTask, updateTaskStatus, PaginatedTasks } from "@/api/alltasks";
import { useNotification } from "@/contexts/NotificationContext"; // ✅ notifikasi
import TinyMCE from "@/components/TinyMCE";

const emptyForm = {
  title: "",
  due_date: "",
  status: "todo",
  paket: "",
  project_id: undefined as number | undefined,
  assigned_to: undefined as number | undefined,
  description: "",
  category: ""
};

const TaskTable = () => {
  const { tasks, setTasks } = useAppData();
  const { activeTimer, fetchActiveTimer, pauseTimer } = useTimeStore();
  const { user } = useAuth();
  const { addNotification } = useNotification(); // ✅ akses notifikasi
  const [assignees, setAssignees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [profilePhotos, setProfilePhotos] = useState<Record<number, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Fungsi untuk menampilkan toast notification
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000); // Auto dismiss setelah 3 detik
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load tasks with pagination and search
  const loadTasks = async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const res = await getTasks(page, 5, search);
      setTasks((Array.isArray(res.data.data) ? res.data.data : []) as any);
      setCurrentPage(res.data.current_page);
      setTotalPages(res.data.last_page);
      setTotalTasks(res.data.total);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debounce
  const handleSearchInput = (value: string) => {
    setSearchInput(value);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1);
      loadTasks(1, value);
    }, 500); // 500ms delay

    setSearchTimeout(timeout);
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchTerm(searchInput);
    setCurrentPage(1);
    loadTasks(1, searchInput);
  };

  // Clear search
  const clearSearch = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
    loadTasks(1, '');
  };

  // Helper function to get profile photo from localStorage
  const getProfilePhoto = (userId: number): string | null => {
    const storageKey = `profile_photo_${userId}`;
    return localStorage.getItem(storageKey);
  };

  // Load profile photos for assignees
  const loadProfilePhotos = useCallback(() => {
    const photos: Record<number, string> = {};
    assignees.forEach((assignee) => {
      const photo = getProfilePhoto(assignee.id);
      if (photo) {
        photos[assignee.id] = photo;
      }
    });
    setProfilePhotos(photos);
  }, [assignees]);

  // Listen for profile photo updates
  useEffect(() => {
    const handleProfilePhotoUpdate = () => {
      loadProfilePhotos();
    };

    window.addEventListener('profilePhotoUpdated', handleProfilePhotoUpdate);

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('profile_photo_')) {
        handleProfilePhotoUpdate();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('profilePhotoUpdated', handleProfilePhotoUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadProfilePhotos]);

  useEffect(() => {
    loadTasks(1);
    // Load assignees for all users to display assigned user names
    import('@/services/axios').then(({ default: ax }) => {
      ax.get('/admin/users').then(r => {
        // Filter out admins from assignees
        const filteredUsers = Array.isArray(r.data)
          ? r.data.filter((u: any) => u.role !== 'admin')
          : [];
        setAssignees(filteredUsers);
        // Load profile photos after assignees are loaded
        setTimeout(() => {
          loadProfilePhotos();
        }, 100);
      }).catch(() => { });

      // Load projects for dropdown
      ax.get('/projects').then(r => {
        setProjects(Array.isArray(r.data) ? r.data : []);
      }).catch(() => { });
    });
  }, [user]);

  // Load profile photos when assignees change
  useEffect(() => {
    if (assignees.length > 0) {
      loadProfilePhotos();
    }
  }, [assignees, loadProfilePhotos]);

  // Notifikasi untuk user yang ditugaskan (non-admin)
  const getKnownTaskIds = () => {
    if (!user) return new Set<number>();
    try {
      const stored = localStorage.getItem(`known_tasks_${user.id}`);
      return stored ? new Set(JSON.parse(stored)) : new Set<number>();
    } catch {
      return new Set<number>();
    }
  };

  const saveKnownTaskIds = (taskIds: Set<number>) => {
    if (!user) return;
    try {
      localStorage.setItem(`known_tasks_${user.id}`, JSON.stringify([...taskIds]));
    } catch { }
  };

  const getTaskVersions = () => {
    if (!user) return new Map<number, any>();
    try {
      const stored = localStorage.getItem(`task_versions_${user.id}`);
      return stored ? new Map(JSON.parse(stored)) : new Map<number, any>();
    } catch {
      return new Map<number, any>();
    }
  };

  const saveTaskVersions = (versions: Map<number, any>) => {
    if (!user) return;
    try {
      localStorage.setItem(`task_versions_${user.id}`, JSON.stringify([...versions]));
    } catch { }
  };

  // Fungsi untuk mengubah URL menjadi link yang dapat diklik
  const convertUrlsToLinks = (text: string) => {
    if (!text) return text;

    // Regex yang lebih komprehensif untuk mendeteksi URL termasuk Google Drive
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+(?: [^\s<>"{}|\\^`\[\].,;:!?]|(?:[.,;:!?](?!\s)))*)/g;

    return text.replace(urlRegex, (url) => {
      // Pastikan URL diakhiri dengan karakter yang valid
      const cleanUrl = url.replace(/[.,;:!?]+$/, '');
      const punctuation = url.match(/[.,;:!?]+$/)?.[0] || '';

      // Cek apakah URL sudah menjadi link HTML
      if (text.includes(`<a href="${cleanUrl}"`) || text.includes(`href="${cleanUrl}"`)) {
        return url;
      }

      // Validasi URL sebelum membuat link
      try {
        new URL(cleanUrl);
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="url-link" style="color: #2563eb; text-decoration: underline; cursor: pointer; font-weight: 500;">${cleanUrl}</a>${punctuation}`;
      } catch (error) {
        // Jika URL tidak valid, return as is
        return url;
      }
    });
  };

  // Notifikasi untuk user biasa (non-admin)
  useEffect(() => {
    if (!user || user.role === 'admin' || (user as any).role === 'customer_service') return;

    const knownTaskIds = getKnownTaskIds();
    const taskVersions = getTaskVersions();
    const current = new Set<number>();
    const newVersions = new Map<number, any>();

    tasks.forEach(t => {
      current.add(t.id);

      // Cek task baru yang ditugaskan ke user
      if (!knownTaskIds.has(t.id) && t.assigned_to === user.id) {
        addNotification(`Tugas baru ditugaskan: "${t.title}" 📌`, '/tasks');
      }

      // Cek update task yang sudah ada
      const previousVersion = taskVersions.get(t.id);
      if (previousVersion && t.assigned_to === user.id) {
        // Cek apakah ada perubahan yang signifikan
        const hasChanges =
          previousVersion.title !== t.title ||
          previousVersion.status !== t.status ||
          previousVersion.description !== t.description ||
          previousVersion.due_date !== t.due_date ||
          previousVersion.priority !== t.priority;

        if (hasChanges) {
          let changeMessage = '';
          if (previousVersion.title !== t.title) {
            changeMessage = `Judul tugas diubah menjadi: "${t.title}"`;
          } else if (previousVersion.status !== t.status) {
            const statusMap: { [key: string]: string } = {
              'todo': 'Belum Dikerjakan',
              'in_progress': 'Sedang Dalam Proses',
              'review': 'Dalam Review',
              'done': 'Selesai'
            };
            const oldStatus = statusMap[previousVersion.status] || previousVersion.status;
            const newStatus = statusMap[t.status] || t.status;
            changeMessage = `Status tugas berubah dari "${oldStatus}" menjadi "${newStatus}"`;
          } else if (previousVersion.due_date !== t.due_date) {
            changeMessage = `Tanggal deadline tugas diubah`;
          } else if (previousVersion.priority !== t.priority) {
            const priorityMap: { [key: string]: string } = {
              'low': 'Rendah',
              'medium': 'Sedang',
              'high': 'Tinggi'
            };
            const oldPriority = priorityMap[previousVersion.priority || 'medium'] || previousVersion.priority;
            const newPriority = priorityMap[t.priority || 'medium'] || t.priority;
            changeMessage = `Prioritas tugas berubah dari "${oldPriority}" menjadi "${newPriority}"`;
          } else {
            changeMessage = `Tugas "${t.title}" telah diperbarui`;
          }

          addNotification(`${changeMessage} 🔄`, '/tasks');
        }
      }

      // Cek jika task baru ditugaskan ke user (perubahan assignee)
      if (previousVersion &&
        previousVersion.assigned_to !== user.id &&
        t.assigned_to === user.id) {
        addNotification(`Anda ditugaskan untuk tugas: "${t.title}" 👤`, '/tasks');
      }

      // Simpan versi task saat ini
      newVersions.set(t.id, {
        title: t.title,
        status: t.status,
        description: t.description,
        due_date: t.due_date,
        priority: t.priority,
        assigned_to: t.assigned_to
      });
    });

    // Simpan data tracking ke localStorage
    saveKnownTaskIds(current);
    saveTaskVersions(newVersions);
  }, [tasks, user, addNotification]);

  // Notifikasi untuk admin - track semua task baru dan update
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const getAdminKnownTaskIds = () => {
      try {
        const stored = localStorage.getItem(`admin_known_task_ids_${user.id}`);
        if (stored) {
          return new Set<number>(JSON.parse(stored));
        }
      } catch { }
      return new Set<number>();
    };

    const getAdminTaskVersions = () => {
      if (!user) return new Map<number, any>();
      try {
        const stored = localStorage.getItem(`admin_task_versions_${user.id}`);
        if (stored) {
          const arr = JSON.parse(stored) as [number, any][];
          return new Map<number, any>(arr);
        }
      } catch { }
      return new Map<number, any>();
    };

    const saveAdminKnownTaskIds = (ids: Set<number>) => {
      if (!user) return;
      try {
        localStorage.setItem(`admin_known_task_ids_${user.id}`, JSON.stringify([...ids]));
      } catch { }
    };

    const saveAdminTaskVersions = (versions: Map<number, any>) => {
      if (!user) return;
      try {
        localStorage.setItem(`admin_task_versions_${user.id}`, JSON.stringify([...versions]));
      } catch { }
    };

    const knownTaskIds = getAdminKnownTaskIds();
    const taskVersions = getAdminTaskVersions();
    const current = new Set<number>();
    const newVersions = new Map<number, any>();

    tasks.forEach(t => {
      current.add(t.id);

      // Cek task baru (admin perlu tahu semua task baru)
      if (!knownTaskIds.has(t.id)) {
        addNotification(`Tugas baru dibuat: "${t.title}" 📌`, '/tasks');
      }

      // Cek update task yang sudah ada
      const previousVersion = taskVersions.get(t.id);
      if (previousVersion) {
        // Cek apakah ada perubahan yang signifikan
        const hasChanges =
          previousVersion.title !== t.title ||
          previousVersion.status !== t.status ||
          previousVersion.description !== t.description ||
          previousVersion.due_date !== t.due_date ||
          previousVersion.priority !== t.priority ||
          previousVersion.assigned_to !== t.assigned_to;

        if (hasChanges) {
          let changeMessage = '';
          if (previousVersion.title !== t.title) {
            changeMessage = `Tugas "${previousVersion.title}" diubah menjadi: "${t.title}"`;
          } else if (previousVersion.status !== t.status) {
            const statusMap: { [key: string]: string } = {
              'todo': 'Belum Dikerjakan',
              'in_progress': 'Sedang Dalam Proses',
              'review': 'Dalam Review',
              'done': 'Selesai'
            };
            const oldStatus = statusMap[previousVersion.status] || previousVersion.status;
            const newStatus = statusMap[t.status] || t.status;
            changeMessage = `Status tugas "${t.title}" berubah dari "${oldStatus}" menjadi "${newStatus}"`;
          } else if (previousVersion.due_date !== t.due_date) {
            changeMessage = `Tanggal deadline tugas "${t.title}" diubah`;
          } else if (previousVersion.priority !== t.priority) {
            const priorityMap: { [key: string]: string } = {
              'low': 'Rendah',
              'medium': 'Sedang',
              'high': 'Tinggi'
            };
            const oldPriority = priorityMap[previousVersion.priority || 'medium'] || previousVersion.priority;
            const newPriority = priorityMap[t.priority || 'medium'] || t.priority;
            changeMessage = `Prioritas tugas "${t.title}" berubah dari "${oldPriority}" menjadi "${newPriority}"`;
          } else if (previousVersion.assigned_to !== t.assigned_to) {
            changeMessage = `Tugas "${t.title}" ditugaskan ke user lain`;
          } else {
            changeMessage = `Tugas "${t.title}" telah diperbarui`;
          }

          addNotification(`${changeMessage} 🔄`, '/tasks');
        }
      }

      // Simpan versi task saat ini
      newVersions.set(t.id, {
        title: t.title,
        status: t.status,
        description: t.description,
        due_date: t.due_date,
        priority: t.priority,
        assigned_to: t.assigned_to
      });
    });

    // Simpan data tracking ke localStorage
    saveAdminKnownTaskIds(current);
    saveAdminTaskVersions(newVersions);
  }, [tasks, user, addNotification]);

  const handleAdd = () => {
    setEditTask(null);
    setForm(emptyForm);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setForm(emptyForm);
    setEditTask(null);
    setIsEditing(false);
    setIsModalOpen(false);
    setShowAssigneeDropdown(false);
  };

  const handleDetail = (task: any) => {
    setEditTask(task);
    setForm({
      title: task.title,
      due_date: task.due_date,
      status: task.status,
      paket: task.paket || "",
      assigned_to: task.assigned_to ?? undefined,
      description: task.description || "",
      category: task.category || "",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditToggle = (task?: any) => {
    if (task) {
      setEditTask(task);
      setForm({
        title: task.title,
        due_date: task.due_date,
        status: task.status,
        paket: task.paket || "",
        assigned_to: task.assigned_to ?? undefined,
        description: task.description || "",
        category: task.category || "",
      });
    }
    setIsEditing(true);
  };

  const handleDelete = (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setTaskToDelete(task);
      setShowDeleteConfirm(true);
    }
  };

  const markDone = async (task: any) => {
    try {
      await updateTaskStatus(task.id, 'done');
      addNotification(`Tugas "${task.title}" ditandai selesai ✅`);
      // Reload current page
      await loadTasks(currentPage, searchTerm);
    } catch {
      addNotification('Gagal mengubah status tugas');
    }
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      try {
        // Import axios and call delete API
        const { default: axios } = await import('@/services/axios');
        const response = await axios.delete(`/tasks/${taskToDelete.id}`);

        // Show success notification with task title
        const taskTitle = response.data.task_title || taskToDelete.title;

        // Show toast notification
        showToastNotification(`Data tugas berhasil dihapus!`);

        // Also add to notification list
        addNotification(`Tugas "${taskTitle}" berhasil dihapus ✅`);

        setShowDeleteConfirm(false);
        setTaskToDelete(null);

        // Reload current page
        await loadTasks(currentPage, searchTerm);
      } catch (error) {
        console.error('Error deleting task:', error);
        addNotification('Gagal menghapus tugas. Pastikan Anda memiliki izin untuk menghapus tugas ini.');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form
    if (!form.title.trim()) {
      addNotification('Judul tugas harus diisi');
      return;
    }

    try {
      // Check if user is admin or customer_service to allow category modification
      const isAdminOrCS = user && (user.role === 'admin' || (user as any).role === 'customer_service');

      if (editTask) {
        console.log('Updating task with data:', {
          title: form.title,
          paket: form.paket,
          description: form.description,
          status: form.status,
          due_date: form.due_date,
          priority: 'medium',
          assigned_to: form.assigned_to ?? null,
        });

        const updateData: any = {
          title: form.title,
          paket: form.paket,
          description: form.description,
          status: form.status,
          due_date: form.due_date,
          priority: 'medium',
          assigned_to: form.assigned_to ?? null,
        };

        // Only include category if user is admin or customer_service
        if (isAdminOrCS) {
          updateData.category = form.category;
        }

        await updateTask(editTask.id, updateData);

        // Show toast notification
        showToastNotification(`Data tugas berhasil diperbarui!`);

        // Notifikasi untuk admin bahwa task berhasil diupdate
        addNotification(`Tugas "${form.title}" berhasil diperbarui ✅`, `/tasks`);

        // Reload current page
        await loadTasks(currentPage, searchTerm);
      } else {
        const createData: any = {
          title: form.title,
          paket: form.paket,
          description: form.description,
          status: form.status,
          due_date: form.due_date,
          project_id: form.project_id || 1, // Use selected project or default to 1
          assigned_to: form.assigned_to ?? null,
          priority: 'medium',
        };

        // Only include category if user is admin or customer_service
        if (isAdminOrCS) {
          createData.category = form.category;
        }

        await createTask(createData);

        // Show toast notification
        showToastNotification(`Data tugas berhasil dibuat!`);

        // Notifikasi untuk admin bahwa task berhasil dibuat
        addNotification(`Tugas "${form.title}" berhasil dibuat ✅`, `/tasks`);

        // Reload first page to show new task
        await loadTasks(1);
      }

      // Reset form dan tutup modal
      setForm(emptyForm);
      setEditTask(null);
      setIsEditing(false);
      setIsModalOpen(false);
      setShowAssigneeDropdown(false);

    } catch (err) {
      console.error('Error saving task:', err);
      addNotification('Gagal menyimpan tugas');
    }
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-sm border border-white/20">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Toast */}
      {showDeleteConfirm && taskToDelete && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 text-gray-800 px-8 py-6 rounded-2xl shadow-2xl text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Konfirmasi Hapus</h3>
          <p className="text-gray-600 mb-6">Yakin ingin menghapus tugas "{taskToDelete.title}"?</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={cancelDelete}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Tabel Tugas</h2>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 hidden sm:block">Kelola dan pantau semua tugas</p>
          </div>
        </div>
        {user && (user.role === 'admin' || (user as any).role === 'customer_service') && (
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Tambahkan Tugas</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Cari</span>
            </button>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Hapus</span>
              </button>
            )}
          </div>
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Menampilkan hasil untuk: <span className="font-medium text-blue-600 dark:text-blue-400">"{searchTerm}"</span>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm sm:text-base text-gray-600">Memuat tugas...</span>
          </div>
        )}
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                    Judul
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider hidden sm:table-cell">
                    Kategori
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider hidden md:table-cell">
                    Paket
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider hidden lg:table-cell">
                    Pengguna yang Ditugaskan
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-500">Belum ada tugas</p>
                        <p className="text-xs sm:text-sm text-gray-400 px-4">Klik "Tambahkan Tugas" untuk membuat tugas pertama</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasks.map((task, index) => (
                    <tr key={task.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                        <div className="flex items-center min-w-0">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                              <span>ID: {task.id}</span>
                              <span className="text-gray-300">•</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${task.status === 'done' ? 'bg-green-100 text-green-800' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                {task.status === 'in_progress' && activeTimer?.task_id === task.id && (
                                  <span className="relative flex h-1.5 w-1.5 mr-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                                  </span>
                                )}
                                {task.status === 'done' ? 'Selesai' :
                                  task.status === 'in_progress' ? 'Sedang Dikerjakan' :
                                    task.status === 'review' ? 'Review' :
                                      'Belum Dikerjakan'}
                              </span>
                            </div>
                            <div className="sm:hidden mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${task.category === 'Company Profil' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                task.category === 'Web Design' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  task.category === 'SMM' ? 'bg-pink-100 text-pink-800 border-pink-200' :
                                    task.category === 'Logo' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                      'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                {task.category || 'Tidak ada'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${task.category === 'Company Profil' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          task.category === 'Web Design' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            task.category === 'SMM' ? 'bg-pink-100 text-pink-800 border-pink-200' :
                              task.category === 'Logo' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                          {task.category || 'Tidak ada'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                          {task.paket || 'Belum ditentukan'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex items-center">
                          {task.assigned_to ? (() => {
                            const assigneeId = task.assigned_to;
                            const profilePhoto = profilePhotos[assigneeId] || getProfilePhoto(assigneeId);
                            return (
                              <>
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center flex-shrink-0 mr-2">
                                  {profilePhoto ? (
                                    <img
                                      src={profilePhoto}
                                      alt={task.assignee?.name || 'User'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs sm:text-sm text-gray-900 dark:text-white capitalize truncate">{task.assignee?.name || "-"}</span>
                              </>
                            );
                          })() : (
                            <>
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <span className="text-xs sm:text-sm text-gray-500">-</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleDetail(task)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-1.5 sm:p-2 lg:p-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                            title="Lihat Detail Tugas"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {(user && (user.role === 'admin' || (user as any).role === 'customer_service')) && (
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-1.5 sm:p-2 lg:p-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                              title="Hapus Tugas"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          {user && user.id === task.assigned_to && task.status !== 'done' && (
                            <>
                              {(task.status === 'todo' || (task.status === 'in_progress' && activeTimer?.task_id !== task.id)) && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateTask(task.id, { status: 'in_progress' });
                                      showToastNotification('Berhasil memulai waktu pengerjaan');
                                      fetchActiveTimer(); // Refresh active timer
                                      loadTasks(currentPage, searchTerm);
                                    } catch (error) {
                                      console.error('Error starting timer:', error);
                                      addNotification('Gagal memulai timer');
                                    }
                                  }}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-1.5 sm:p-2 lg:p-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                                  title={task.status === 'in_progress' ? "Lanjutkan Timer" : "Mulai Timer (Ubah ke Sedang Dikerjakan)"}
                                >
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              )}
                              {task.status === 'in_progress' && activeTimer?.task_id === task.id && (
                                <button
                                  onClick={async () => {
                                    try {
                                      if (activeTimer) {
                                        await pauseTimer(activeTimer.id);
                                        showToastNotification('Timer dijeda');
                                        fetchActiveTimer(); // Refresh active timer
                                        loadTasks(currentPage, searchTerm);
                                      }
                                    } catch (error) {
                                      console.error('Error pausing timer:', error);
                                      addNotification('Gagal menjeda timer');
                                    }
                                  }}
                                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-1.5 sm:p-2 lg:p-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                                  title="Jeda Timer"
                                >
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => markDone(task)}
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-1.5 sm:p-2 lg:p-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                                title="Tandai Selesai"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
            Menampilkan {((currentPage - 1) * 5) + 1} sampai {Math.min(currentPage * 5, totalTasks)} dari {totalTasks} tugas
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => loadTasks(currentPage - 1, searchTerm)}
              disabled={currentPage === 1 || loading}

              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Sebelumnya</span>
              <span className="sm:hidden">Prev</span>
            </button>

            <div className="flex items-center space-x-1 overflow-x-auto">
              {(() => {
                const getVisiblePages = (current: number, total: number) => {
                  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

                  let start = current - 2;
                  let end = current + 2;

                  if (start < 1) {
                    start = 1;
                    end = 5;
                  }

                  if (end > total) {
                    end = total;
                    start = total - 4;
                  }

                  return Array.from({ length: 5 }, (_, i) => start + i);
                };

                return getVisiblePages(currentPage, totalPages).map((page) => (
                  <button
                    key={page}
                    onClick={() => loadTasks(page, searchTerm)}
                    disabled={loading}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {page}
                  </button>
                ));
              })()}
            </div>

            <button
              onClick={() => loadTasks(currentPage + 1, searchTerm)}
              disabled={currentPage === totalPages || loading}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <span className="sm:hidden">Next</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Detail / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {isEditing ? (editTask ? "Edit Tugas" : "Tambah Tugas") : "Detail Tugas"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isEditing ? "Ubah informasi tugas" : "Lihat detail tugas"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Judul Tugas</label>
                    <input
                      type="text"
                      placeholder="Masukkan judul tugas"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-700"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deskripsi</label>
                    <TinyMCE
                      value={form.description}
                      onChange={(content) => setForm({ ...form, description: content })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tanggal Jatuh Tempo</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-700"
                        value={form.due_date}
                        onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-700"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="todo">Belum Dikerjakan</option>
                        <option value="in_progress">Sedang Dalam Proses</option>
                        <option value="done">Selesai</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Paket</label>
                      {user && (user.role === 'admin' || (user as any).role === 'customer_service') ? (
                        <select
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-700"
                          value={form.paket}
                          onChange={(e) => setForm({ ...form, paket: e.target.value })}
                          required
                        >
                          <option value="">Pilih Paket</option>
                          <option value="startup">Startup</option>
                          <option value="business">Business</option>
                          <option value="enterprise">Enterprise</option>
                          <option value="elite">Elite</option>
                          <option value="custom">Custom</option>
                        </select>
                      ) : (
                        <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600">
                          {form.paket === 'startup' ? 'Startup' :
                            form.paket === 'business' ? 'Business' :
                              form.paket === 'enterprise' ? 'Enterprise' :
                                form.paket === 'elite' ? 'Elite' :
                                  form.paket === 'custom' ? 'Custom' : 'Tidak ada paket'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
                      {user && (user.role === 'admin' || (user as any).role === 'customer_service') ? (
                        <select
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-700"
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          required
                        >
                          <option value="">Pilih Kategori</option>
                          <option value="Company Profil">Company Profil</option>
                          <option value="Web Design">Web Design</option>
                          <option value="SMM">SMM</option>
                          <option value="Logo">Logo</option>
                        </select>
                      ) : (
                        <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600">
                          {form.category || 'Tidak ada kategori'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pengguna yang Ditugaskan</label>
                      {user && (user.role === 'admin' || (user as any).role === 'customer_service') ? (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              {form.assigned_to ? (() => {
                                const selectedAssignee = assignees.find(u => u.id === form.assigned_to);
                                const profilePhoto = selectedAssignee ? (profilePhotos[selectedAssignee.id] || getProfilePhoto(selectedAssignee.id)) : null;
                                return (
                                  <>
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center flex-shrink-0">
                                      {profilePhoto ? (
                                        <img
                                          src={profilePhoto}
                                          alt={selectedAssignee?.name || 'User'}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                    <span>{selectedAssignee?.name || 'Pilih User'}</span>
                                  </>
                                );
                              })() : (
                                <span className="text-gray-500">Pilih User</span>
                              )}
                            </div>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${showAssigneeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showAssigneeDropdown && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowAssigneeDropdown(false)}
                              />
                              <div
                                className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="p-2">
                                  {/* Header */}
                                  <div className="px-3 py-2 bg-blue-600 text-white font-semibold text-sm mb-2 rounded-lg sticky top-0 z-10">
                                    PENGGUNA YANG DITU
                                  </div>

                                  {/* Option: Tidak ada pengguna */}
                                  <div
                                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer flex items-center space-x-2 mb-1"
                                    onClick={() => {
                                      setForm({ ...form, assigned_to: undefined });
                                      setShowAssigneeDropdown(false);
                                    }}
                                  >
                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </div>
                                    <span className="text-sm text-gray-500">Tidak ada pengguna</span>
                                  </div>

                                  {/* List of assignees */}
                                  {assignees.map(u => {
                                    const profilePhoto = profilePhotos[u.id] || getProfilePhoto(u.id);
                                    return (
                                      <div
                                        key={u.id}
                                        className={`px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer flex items-center space-x-2 ${form.assigned_to === u.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                                          }`}
                                        onClick={() => {
                                          setForm({ ...form, assigned_to: u.id });
                                          setShowAssigneeDropdown(false);
                                        }}
                                      >
                                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                                          {profilePhoto ? (
                                            <img
                                              src={profilePhoto}
                                              alt={u.name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{u.role}</div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 flex items-center space-x-2">
                          {form.assigned_to ? (() => {
                            const selectedAssignee = assignees.find(u => u.id === form.assigned_to);
                            const profilePhoto = selectedAssignee ? (profilePhotos[selectedAssignee.id] || getProfilePhoto(selectedAssignee.id)) : null;
                            return (
                              <>
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center flex-shrink-0">
                                  {profilePhoto ? (
                                    <img
                                      src={profilePhoto}
                                      alt={selectedAssignee?.name || 'User'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <span>{selectedAssignee?.name || 'User tidak ditemukan'}</span>
                              </>
                            );
                          })() : (
                            <span>Tidak ada pengguna yang ditugaskan</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setShowAssigneeDropdown(false);
                      }}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Simpan</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Judul</label>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">{form.title}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Tanggal Jatuh Tempo</label>
                        <p className="text-gray-900 dark:text-white">{form.due_date}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${form.status === 'done' ? 'bg-green-100 text-green-800' :
                          form.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {form.status === 'done' ? 'Selesai' :
                            form.status === 'in_progress' ? (
                              <span className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                Sedang Dalam Proses
                              </span>
                            ) :
                              'Belum Dikerjakan'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Paket</label>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                          {form.paket}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Kategori</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${form.category === 'Company Profil' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          form.category === 'Web Design' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            form.category === 'SMM' ? 'bg-pink-100 text-pink-800 border border-pink-200' :
                              form.category === 'Logo' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                          {form.category || 'Tidak ada'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Pengguna yang Ditugaskan</label>
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="text-gray-900 dark:text-white capitalize">{form.assignedUserId}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Deskripsi</label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 modal-content">
                      <div
                        className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 description-content"
                        dangerouslySetInnerHTML={{
                          __html: convertUrlsToLinks(form.description || 'Tidak ada deskripsi')
                        }}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          // Cek apakah yang diklik adalah link atau elemen di dalam link
                          const linkElement = target.closest('a');
                          if (linkElement) {
                            e.preventDefault();
                            e.stopPropagation();
                            const href = linkElement.getAttribute('href');
                            if (href) {
                              // Validasi URL sebelum membuka
                              try {
                                new URL(href);
                                window.open(href, '_blank', 'noopener,noreferrer');
                              } catch (error) {
                                console.error('Invalid URL:', href);
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => handleEditToggle(editTask)}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTable;
