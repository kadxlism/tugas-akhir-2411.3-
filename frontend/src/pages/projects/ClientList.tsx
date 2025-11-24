import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "@/services/axios";
import { useAppData, Client } from "@/contexts/AppDataContext";
import { getClients, PaginatedClients } from "@/api/clients";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/useAuth";
import TinyMCE from "@/components/TinyMCE";
import { useLanguage } from "@/contexts/LanguageContext";

const ClientList = () => {
  const { clients, setClients } = useAppData();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [selectedClientForProject, setSelectedClientForProject] = useState<Client | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    assigned_to: undefined as number | undefined,
  });

  const [assignees, setAssignees] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fungsi untuk menampilkan toast notification
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000); // Auto dismiss setelah 3 detik
  };

  const [form, setForm] = useState<Client>({
    id: 0,
    company_name: "",
    owner: "",
    phone: "",
    package: "",
    deadline: "",
    dp: "",
    category: "",
    created_at: "",
    updated_at: "",
  });

  // Load clients with pagination and search
  const mapApiClientToContext = (client: any): Client => ({
    id: client.id,
    company_name: client.company_name ?? client.companyName ?? '',
    owner: client.owner ?? client.owner_name ?? client.ownerName ?? '',
    phone: client.phone ?? '',
    package: client.package ?? '',
    deadline: client.deadline ?? '',
    dp: client.dp ?? '',
    category: client.category ?? '',
    created_at: client.created_at ?? '',
    updated_at: client.updated_at ?? '',
  });

  const loadClients = async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const res = await getClients(page, 5, search);
      const mappedClients = Array.isArray(res.data.data)
        ? res.data.data.map((client: any) => mapApiClientToContext(client))
        : [];
      setClients(mappedClients);
      setCurrentPage(res.data.current_page);
      setTotalPages(res.data.last_page);
      setTotalClients(res.data.total);
    } catch (error) {
      console.error('Error loading clients:', error);
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
      loadClients(1, value);
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
    loadClients(1, searchInput);
  };

  // Clear search
  const clearSearch = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
    loadClients(1, '');
  };

  useEffect(() => {
    loadClients(1);

    // Load assignees (users) for assigning default task when creating project from client
    axios
      .get('/admin/users')
      .then((res) => {
        const users = Array.isArray(res.data) ? res.data : [];
        setAssignees(users.filter((u: any) => u.role !== 'admin'));
      })
      .catch((err) => {
        console.error('Error loading assignees for projects:', err);
      });
  }, []);

  // Notifikasi untuk admin - track semua client baru dan update
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const getAdminKnownClientIds = () => {
      try {
        const stored = localStorage.getItem(`admin_known_client_ids_${user.id}`);
        if (stored) {
          return new Set<number>(JSON.parse(stored));
        }
      } catch { }
      return new Set<number>();
    };

    const getAdminClientVersions = () => {
      if (!user) return new Map<number, any>();
      try {
        const stored = localStorage.getItem(`admin_client_versions_${user.id}`);
        if (stored) {
          const arr = JSON.parse(stored) as [number, any][];
          return new Map<number, any>(arr);
        }
      } catch { }
      return new Map<number, any>();
    };

    const saveAdminKnownClientIds = (ids: Set<number>) => {
      if (!user) return;
      try {
        localStorage.setItem(`admin_known_client_ids_${user.id}`, JSON.stringify([...ids]));
      } catch { }
    };

    const saveAdminClientVersions = (versions: Map<number, any>) => {
      if (!user) return;
      try {
        localStorage.setItem(`admin_client_versions_${user.id}`, JSON.stringify([...versions]));
      } catch { }
    };

    const knownClientIds = getAdminKnownClientIds();
    const clientVersions = getAdminClientVersions();
    const current = new Set<number>();
    const newVersions = new Map<number, any>();

    clients.forEach(c => {
      current.add(c.id);

      // Cek client baru (admin perlu tahu semua client baru)
      if (!knownClientIds.has(c.id)) {
        addNotification(`${t('clients.clientCreated')}: "${c.company_name}" 📌`, '/clients');
      }

      // Cek update client yang sudah ada
      const previousVersion = clientVersions.get(c.id);
      if (previousVersion) {
        // Cek apakah ada perubahan yang signifikan
        const hasChanges =
          previousVersion.company_name !== c.company_name ||
          previousVersion.owner !== c.owner ||
          previousVersion.phone !== c.phone ||
          previousVersion.package !== c.package ||
          previousVersion.deadline !== c.deadline ||
          previousVersion.dp !== c.dp ||
          previousVersion.category !== c.category;

        if (hasChanges) {
          let changeMessage = '';
          if (previousVersion.company_name !== c.company_name) {
            changeMessage = `${t('clients.companyName')} ${t('notifications.from')} "${previousVersion.company_name}" ${t('notifications.to')} "${c.company_name}"`;
          } else if (previousVersion.owner !== c.owner) {
            changeMessage = `${t('clients.owner')} ${t('clients.title')} "${c.company_name}" ${t('notifications.from')} "${previousVersion.owner}" ${t('notifications.to')} "${c.owner}"`;
          } else if (previousVersion.phone !== c.phone) {
            changeMessage = `${t('clients.phone')} ${t('clients.title')} "${c.company_name}" ${t('notifications.taskUpdated')}`;
          } else if (previousVersion.package !== c.package) {
            changeMessage = `${t('clients.package')} ${t('clients.title')} "${c.company_name}" ${t('notifications.from')} "${previousVersion.package}" ${t('notifications.to')} "${c.package}"`;
          } else if (previousVersion.deadline !== c.deadline) {
            changeMessage = `${t('clients.deadline')} ${t('clients.title')} "${c.company_name}" ${t('notifications.taskUpdated')}`;
          } else if (previousVersion.dp !== c.dp) {
            changeMessage = `${t('clients.paymentStatus')} ${t('clients.title')} "${c.company_name}" ${t('notifications.from')} "${previousVersion.dp}" ${t('notifications.to')} "${c.dp}"`;
          } else if (previousVersion.category !== c.category) {
            changeMessage = `${t('clients.category')} ${t('clients.title')} "${c.company_name}" ${t('notifications.from')} "${previousVersion.category || 'Tidak ada'}" ${t('notifications.to')} "${c.category || 'Tidak ada'}"`;
          } else {
            changeMessage = `${t('clients.clientUpdated')}: "${c.company_name}"`;
          }

          addNotification(`${changeMessage} 🔄`, '/clients');
        }
      }

      // Simpan versi client saat ini
      newVersions.set(c.id, {
        company_name: c.company_name,
        owner: c.owner,
        phone: c.phone,
        package: c.package,
        deadline: c.deadline,
        dp: c.dp,
        category: c.category
      });
    });

    // Simpan data tracking ke localStorage
    saveAdminKnownClientIds(current);
    saveAdminClientVersions(newVersions);
  }, [clients, user, addNotification]);

  const handleAdd = () => {
    setEditClient(null);
    setForm({
      id: 0,
      company_name: "",
      owner: "",
      phone: "",
      package: "",
      deadline: "",
      dp: "",
      category: "",
      created_at: "",
      updated_at: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditClient(client);
    setForm(client);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    const client = clients.find((c) => c.id === id);
    if (client) {
      setClientToDelete(client);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      try {
        await axios.delete(`/clients/${clientToDelete.id}`);
        showToastNotification(`${t('clients.clientDeleted')}!`);
        // Reload current page
        await loadClients(currentPage);
      } catch (error) {
        console.error('Error deleting client:', error);
      } finally {
        setShowDeleteConfirm(false);
        setClientToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setClientToDelete(null);
  };

  const handleCreateProject = (client: Client) => {
    setSelectedClientForProject(client);
    setProjectForm({
      name: `${client.company_name} - Project`,
      description: '',
      start_date: '',
      end_date: client.deadline || '',
      assigned_to: undefined,
    });
    setShowCreateProjectModal(true);
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForProject) return;

    try {
      // 1) Buat project terkait client
      const projectRes = await axios.post('/projects', {
        name: projectForm.name,
        client_table_id: selectedClientForProject.id,
        description: projectForm.description,
        start_date: projectForm.start_date || null,
        end_date: projectForm.end_date || null,
        status: 'active',
      });

      const project = projectRes.data;

      // 2) Otomatis buat satu task untuk project ini
      //    Mengambil data paket, kategori, dan tenggat dari client
      await axios.post('/tasks', {
        project_id: project.id,
        title: projectForm.name,
        paket: selectedClientForProject.package,
        category: selectedClientForProject.category,
        assigned_to: projectForm.assigned_to || null,
        description: projectForm.description,
        status: 'todo',
        due_date: selectedClientForProject.deadline,
        priority: 'medium',
      });

      showToastNotification(
        `${t('clients.projectCreated')} ${selectedClientForProject.company_name}!`
      );
      setShowCreateProjectModal(false);
      setSelectedClientForProject(null);
      setProjectForm({ name: '', description: '', start_date: '', end_date: '', assigned_to: undefined });
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert(error.response?.data?.message || t('common.error'));
    }
  };

  // Validasi tanggal deadline
  const validateDeadline = (date: string) => {
    const today = new Date();
    const deadline = new Date(date);
    today.setHours(0, 0, 0, 0); // Reset time untuk perbandingan yang akurat

    if (deadline < today) {
      alert(t('clients.deadlineError'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi deadline
    if (!validateDeadline(form.deadline)) {
      return;
    }

    try {
      if (editClient) {
        await axios.put(`/clients/${editClient.id}`, form);
        showToastNotification(`${t('clients.clientUpdated')}!`);
        // Reload current page
        await loadClients(currentPage);
      } else {
        await axios.post("/clients", form);
        showToastNotification(`${t('clients.clientCreated')}!`);
        // Reload first page to show new client
        await loadClients(1);
      }
    } catch (error) {
      console.log("API error:", error);
    } finally {
      setIsModalOpen(false);
      setEditClient(null);
    }
  };

  // EXPORT EXCEL
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(clients);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, "clients.xlsx");
  };

  // IMPORT EXCEL
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const importedData: any[] = XLSX.utils.sheet_to_json(sheet);

      // Import data ke backend (jika ada API untuk bulk import)
      try {
        for (const row of importedData) {
          await axios.post("/clients", {
            company_name: row.company_name || "",
            owner: row.owner || "",
            phone: row.phone || "",
            package: row.package || "",
            deadline: row.deadline || "",
            dp: row.dp || "",
          });
        }
        showToastNotification(t('clients.importSuccess'));
        // Reload halaman pertama
        await loadClients(1);
      } catch (error) {
        console.error('Error importing clients:', error);
        showToastNotification(t('clients.importError'));
      }
    };
    reader.readAsArrayBuffer(file);
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

      {/* Create Project Modal */}
      {showCreateProjectModal && selectedClientForProject && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('clients.createProjectFor')} {selectedClientForProject.company_name}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateProjectModal(false);
                    setSelectedClientForProject(null);
                    setProjectForm({ name: '', description: '', start_date: '', end_date: '', assigned_to: undefined });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('clients.projectName')}
                  </label>
                  <input
                    type="text"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('clients.description')}
                  </label>
                  <TinyMCE
                    value={projectForm.description}
                    onChange={(content) => setProjectForm({ ...projectForm, description: content })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('clients.startDate')}
                    </label>
                    <input
                      type="date"
                      value={projectForm.start_date}
                      onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('clients.endDate')}
                    </label>
                    <input
                      type="date"
                      value={projectForm.end_date}
                      onChange={(e) => setProjectForm({ ...projectForm, end_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('clients.assignedUserOptional')}
                  </label>
                  <select
                    value={projectForm.assigned_to || ''}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        assigned_to: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('clients.noSpecificUser')}</option>
                    {assignees.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateProjectModal(false);
                      setSelectedClientForProject(null);
                      setProjectForm({ name: '', description: '', start_date: '', end_date: '', assigned_to: undefined });
                    }}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    {t('clients.createProject')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Toast */}
      {showDeleteConfirm && clientToDelete && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-8 py-6 rounded-2xl shadow-2xl text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('clients.deleteConfirm')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('clients.deleteConfirmDesc')} "{clientToDelete.company_name}"?</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={cancelDelete}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-colors"
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{t('clients.title')}</h2>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 hidden sm:block">{t('clients.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{t('clients.addClient')}</span>
        </button>
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
              placeholder={t('clients.searchClients')}
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800"
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
              <span className="hidden sm:inline">{t('common.search')}</span>
            </button>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">{t('common.clear')}</span>
              </button>
            )}
          </div>
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('clients.searchResults')} <span className="font-medium text-blue-600 dark:text-blue-400">"{searchTerm}"</span>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                    {t('clients.companyName')}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider hidden sm:table-cell">
                    {t('clients.owner')}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider hidden md:table-cell">
                    {t('clients.phone')}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider hidden lg:table-cell">
                    {t('clients.package')}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider hidden lg:table-cell">
                    {t('clients.deadline')}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider hidden md:table-cell">
                    {t('clients.paymentStatus')}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider hidden xl:table-cell">
                    {t('clients.category')}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                    {t('clients.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('clients.loading')}</p>
                      </div>
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-500 dark:text-gray-400">{t('clients.noClients')}</p>
                        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 px-4">{t('clients.noClientsDesc')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map((client, index) => (
                    <tr key={client.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-25 dark:bg-gray-800/50'}`}>
                      <td className="px-3 sm:px-4 lg:px-6 py-3">
                        <div className="flex items-center min-w-0">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{client.company_name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {client.id}</div>
                            <div className="sm:hidden mt-1 space-y-1">
                              <div className="text-xs text-gray-600 dark:text-gray-400">Pemilik: {client.owner}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Telp: {client.phone || 'Tidak ada'}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 whitespace-nowrap hidden sm:table-cell">
                        <div className="flex items-center">
                          <div className="w-5 h-5 bg-gradient-to-br from-white to-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                            <svg className="w-2.5 h-2.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">{client.owner}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center">
                          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">{client.phone || 'Tidak ada'}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 whitespace-nowrap hidden lg:table-cell">
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                          {client.package}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex items-center">
                          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">{client.deadline}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 whitespace-nowrap hidden md:table-cell">
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${client.dp === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' :
                          client.dp === 'down-payment' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            client.dp.includes('termin') ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                          {client.dp}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 whitespace-nowrap hidden xl:table-cell">
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${client.category === 'Company Profil' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          client.category === 'Web Design' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            client.category === 'SMM' ? 'bg-pink-100 text-pink-800 border border-pink-200' :
                              client.category === 'Logo' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                          {client.category || 'Tidak ada'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-6 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleCreateProject(client)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-1.5 sm:p-2 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                            title="Buat Project"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(client)}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-1.5 sm:p-2 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                            title="Edit Klien"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-1.5 sm:p-2 rounded text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                            title="Hapus Klien"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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

      {/* Export, Import, Pagination */}
      <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mt-4 sm:mt-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleExport}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Ekspor Excel</span>
          </button>

          <label className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer text-sm sm:text-base">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>Impor Excel</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
              Menampilkan {((currentPage - 1) * 5) + 1} sampai {Math.min(currentPage * 5, totalClients)} dari {totalClients} klien
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => loadClients(currentPage - 1, searchTerm)}
                disabled={currentPage === 1 || loading}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      onClick={() => loadClients(page, searchTerm)}
                      disabled={loading}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </button>
                  ));
                })()}
              </div>
              <button
                onClick={() => loadClients(currentPage + 1, searchTerm)}
                disabled={currentPage === totalPages || loading}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <span className="sm:hidden">Next</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-900/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editClient ? "Edit Klien" : "Tambah Klien"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {editClient ? "Ubah informasi klien" : "Tambah klien baru"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Perusahaan</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama perusahaan"
                      value={form.company_name}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pemilik</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama pemilik"
                      value={form.owner}
                      onChange={(e) => setForm({ ...form, owner: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Masukkan nomor telepon (contoh: 081234567890)"
                    value={form.phone}
                    onChange={(e) => {
                      // Hanya menerima angka dan karakter khusus untuk nomor telepon
                      const value = e.target.value.replace(/[^0-9+\-() ]/g, '');
                      setForm({ ...form, phone: value });
                    }}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Paket</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={form.package}
                      onChange={(e) => setForm({ ...form, package: e.target.value })}
                      required
                    >
                      <option value="">Pilih Paket</option>
                      <option value="startup">Startup</option>
                      <option value="business">Business</option>
                      <option value="enterprise">Enterprise</option>
                      <option value="elite">Elite</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tenggat Waktu</label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status Pembayaran</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={form.dp}
                      onChange={(e) => setForm({ ...form, dp: e.target.value })}
                      required
                    >
                      <option value="">Pilih Status Payment</option>
                      <option value="down-payment">Down Payment</option>
                      <option value="paid">Paid</option>
                      <option value="termin-1">Termin 1</option>
                      <option value="termin-2">Termin 2</option>
                      <option value="termin-3">Termin 3</option>
                      <option value="tagihan">Tagihan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
