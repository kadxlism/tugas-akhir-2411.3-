import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import EditNameForm from "@/components/settings/EditNameForm";
import EditEmailForm from "@/components/settings/EditEmailForm";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";
import DeviceSessions from "@/components/settings/DeviceSessions";

import Modal from "@/components/Modal";

const Settings = () => {
  const { user, logout, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState(user?.name || '');
  const [currentUserEmail, setCurrentUserEmail] = useState(user?.email || '');
  const [isDeletePhotoModalOpen, setIsDeletePhotoModalOpen] = useState(false);

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setCurrentUserName(user.name || '');
      setCurrentUserEmail(user.email || '');
    }
  }, [user]);

  // Handle successful name update
  const handleNameUpdate = (newName: string) => {
    setCurrentUserName(newName);
    if (user && setUser) {
      setUser({ ...user, name: newName });
    }
    showToastNotification(t('settings.nameUpdated'));
  };

  // Handle successful email update
  const handleEmailUpdate = (newEmail: string) => {
    setCurrentUserEmail(newEmail);
    if (user && setUser) {
      setUser({ ...user, email: newEmail });
    }
    showToastNotification(t('settings.emailUpdated'));
  };

  // Handle successful password update
  const handlePasswordUpdate = () => {
    showToastNotification(t('settings.passwordUpdated'));
  };

  // Handle theme change
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    showToastNotification(`${t('settings.themeChanged')} ${newTheme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}`);
  };

  // Handle language change
  const handleLanguageChange = (newLang: 'id' | 'en') => {
    setLanguage(newLang);
    showToastNotification(`${t('settings.languageChanged')} ${newLang === 'id' ? t('settings.indonesian') : t('settings.english')}`);
  };


  // Fungsi untuk menampilkan toast notification
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleExportData = () => {
    // Export semua data ke JSON
    const clients = JSON.parse(localStorage.getItem('clients_data') || '[]');
    const tasks = JSON.parse(localStorage.getItem('tasks_data') || '[]');
    const projects = JSON.parse(localStorage.getItem('projects_data') || '[]');
    const users = JSON.parse(localStorage.getItem('users_data') || '[]');

    const allData = {
      clients,
      tasks,
      projects,
      users,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showToastNotification(t('settings.dataExported'));
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.clients) localStorage.setItem('clients_data', JSON.stringify(data.clients));
        if (data.tasks) localStorage.setItem('tasks_data', JSON.stringify(data.tasks));
        if (data.projects) localStorage.setItem('projects_data', JSON.stringify(data.projects));
        if (data.users) localStorage.setItem('users_data', JSON.stringify(data.users));

        showToastNotification(t('settings.dataImported'));
      } catch (error) {
        showToastNotification(t('settings.invalidFile'));
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm(t('settings.clearDataConfirm'))) {
      localStorage.removeItem('clients_data');
      localStorage.removeItem('tasks_data');
      localStorage.removeItem('projects_data');
      localStorage.removeItem('users_data');
      showToastNotification(t('settings.dataCleared'));
    }
  };

  // Load profile photo on mount and when user changes
  useEffect(() => {
    if (!user) {
      setProfilePhoto(null);
      return;
    }

    // Try to get user ID from different possible fields
    const userId = user.id || (user as any).user_id || (user as any)._id || String(user.email) || 'default';

    if (userId) {
      const storageKey = `profile_photo_${userId}`;
      const storedPhoto = localStorage.getItem(storageKey);

      if (storedPhoto) {
        setProfilePhoto(storedPhoto);
      } else {
        // Clear photo if no stored photo found
        setProfilePhoto(null);
      }
    } else {
      setProfilePhoto(null);
    }
  }, [user]);

  // Compress and resize image
  const compressImage = (file: File, maxWidth: number = 600, maxHeight: number = 600, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            // Calculate new dimensions
            let width = img.width;
            let height = img.height;
            const aspectRatio = width / height;

            if (width > height) {
              if (width > maxWidth) {
                width = maxWidth;
                height = width / aspectRatio;
              }
            } else {
              if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
              }
            }

            // Ensure dimensions are integers
            width = Math.floor(width);
            height = Math.floor(height);

            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }

            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to base64 with compression, try different quality levels
            const maxSize = 1.5 * 1024 * 1024; // 1.5MB limit (safer for localStorage)
            let currentQuality = quality;
            let compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);

            // If still too large, reduce quality further
            while (compressedDataUrl.length > maxSize && currentQuality > 0.4) {
              currentQuality -= 0.05;
              compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
            }

            // If still too large, reduce dimensions further
            if (compressedDataUrl.length > maxSize) {
              let scaleFactor = 0.8;
              let attempts = 0;
              const maxAttempts = 3;

              while (compressedDataUrl.length > maxSize && attempts < maxAttempts) {
                width = Math.floor(width * scaleFactor);
                height = Math.floor(height * scaleFactor);
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                currentQuality = 0.6;
                compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);

                // Try reducing quality again
                while (compressedDataUrl.length > maxSize && currentQuality > 0.4) {
                  currentQuality -= 0.05;
                  compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
                }

                scaleFactor = 0.9;
                attempts++;
              }
            }

            // Final check - if still too large, reject
            if (compressedDataUrl.length > 2 * 1024 * 1024) {
              reject(new Error(`Foto terlalu besar setelah kompresi (${Math.round(compressedDataUrl.length / 1024)}KB). Silakan gunakan foto yang lebih kecil.`));
              return;
            }

            resolve(compressedDataUrl);
          } catch (error) {
            reject(error instanceof Error ? error : new Error('Failed to compress image'));
          }
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle profile photo upload
  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToastNotification(t('settings.mustBeImage'));
      return;
    }

    // Validate initial file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      showToastNotification(t('settings.maxFileSize'));
      return;
    }

    if (!user) {
      showToastNotification(t('settings.userNotFound'));
      return;
    }

    // Try to get user ID from different possible fields
    const userId = user.id || (user as any).user_id || (user as any)._id || String(user.email) || 'default';

    if (!userId) {
      showToastNotification(t('settings.userIdNotFound'));
      return;
    }

    const storageKey = `profile_photo_${userId}`;

    try {
      // Show loading message
      showToastNotification(t('settings.compressing'));

      // Compress and resize image (max 600x600px, quality 0.7)
      const compressedImage = await compressImage(file, 600, 600, 0.7);

      // Check compressed size (should be less than 2MB after compression)
      const compressedSize = compressedImage.length;
      console.log(`Foto berhasil dikompresi: ${Math.round(file.size / 1024)}KB -> ${Math.round(compressedSize / 1024)}KB`);

      // Note: compressImage already ensures size is less than 2MB, but double-check here
      if (compressedSize > 2 * 1024 * 1024) {
        showToastNotification(`Foto terlalu besar setelah kompresi (${Math.round(compressedSize / 1024)}KB). Silakan gunakan foto yang lebih kecil atau resolusi lebih rendah.`);
        return;
      }

      // Try to save to localStorage
      try {
        setProfilePhoto(compressedImage);
        localStorage.setItem(storageKey, compressedImage);

        // Dispatch custom event to notify other components (like Sidebar)
        window.dispatchEvent(new CustomEvent('profilePhotoUpdated', {
          detail: { userId, photo: compressedImage }
        }));

        showToastNotification(t('settings.photoUpdated'));
      } catch (storageError: any) {
        // If storage is full, show helpful error message
        if (storageError.name === 'QuotaExceededError' || storageError.message?.includes('quota') || storageError.message?.includes('kuota')) {
          console.error('Storage quota exceeded:', storageError);

          // Try to estimate storage usage
          let totalSize = 0;
          try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
              try {
                const item = localStorage.getItem(key);
                if (item) {
                  totalSize += item.length;
                }
              } catch (e) {
                // Ignore errors for individual items
              }
            });
          } catch (e) {
            // Ignore errors when calculating total size
          }

          const totalSizeMB = totalSize > 0 ? (totalSize / (1024 * 1024)).toFixed(2) : 'tidak diketahui';
          const photoSizeKB = Math.round(compressedSize / 1024);

          // Show detailed error message (limit message length)
          const message = `Penyimpanan penuh (${totalSizeMB}MB). Foto: ${photoSizeKB}KB. Hapus data lama di Pengaturan atau gunakan foto lebih kecil.`;
          showToastNotification(message);

        } else {
          // Other errors
          console.error('Error saving profile photo:', storageError);
          const errorMessage = storageError instanceof Error ? storageError.message : 'Unknown error';
          showToastNotification(`${t('settings.savePhotoFailed')}: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error compressing profile photo:', error);
      showToastNotification(`${t('settings.compressFailed')}: ` + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Handle profile photo removal
  const handleRemoveProfilePhoto = () => {
    setIsDeletePhotoModalOpen(true);
  };

  const confirmRemoveProfilePhoto = () => {
    if (!user) {
      showToastNotification(t('settings.userNotFound'));
      setIsDeletePhotoModalOpen(false);
      return;
    }

    // Try to get user ID from different possible fields
    const userId = user.id || (user as any).user_id || (user as any)._id || String(user.email) || 'default';

    if (!userId) {
      showToastNotification(t('settings.deletePhotoFailedId'));
      setIsDeletePhotoModalOpen(false);
      return;
    }

    const storageKey = `profile_photo_${userId}`;

    try {
      setProfilePhoto(null);
      localStorage.removeItem(storageKey);

      // Dispatch custom event to notify other components (like Sidebar)
      window.dispatchEvent(new CustomEvent('profilePhotoUpdated', {
        detail: { userId, photo: null }
      }));

      showToastNotification(t('settings.photoDeleted'));
    } catch (error) {
      console.error('Error removing profile photo:', error);
      showToastNotification(t('settings.deletePhotoFailed'));
    } finally {
      setIsDeletePhotoModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Delete Photo Modal */}
      {isDeletePhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeletePhotoModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[90%] max-w-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.removePhotoTitle')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.deletePhotoConfirm') || "Apakah Anda yakin ingin menghapus foto profil?"}</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={confirmRemoveProfilePhoto}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('common.confirm') || "Konfirmasi"}
              </button>
              <button
                onClick={() => setIsDeletePhotoModalOpen(false)}
                className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                {t('common.cancel') || "Batal"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-sm border border-white/20">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="p-2 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 lg:mb-8">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h2>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 hidden sm:block">{t('settings.subtitle')}</p>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/50 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {t('settings.userInfo')}
            </h2>
          </div>

          {/* Profile Photo Section */}
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                {profilePhoto && (
                  <button
                    onClick={handleRemoveProfilePhoto}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                    title={t('settings.removePhotoTitle')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex flex-col items-center space-y-2">
                <label className="cursor-pointer">
                  <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold">{profilePhoto ? t('settings.changePhoto') : t('settings.uploadPhoto')}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {t('settings.photoFormat')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <EditNameForm
              currentName={currentUserName}
              onSuccess={handleNameUpdate}
            />
            <EditEmailForm
              currentEmail={currentUserEmail}
              onSuccess={handleEmailUpdate}
            />
            <div className="group sm:col-span-2 lg:col-span-1">
              <label className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">{t('settings.role')}</label>
              <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-600 group-hover:shadow-md transition-all duration-200">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-500 text-white capitalize">
                  {user?.role || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <ChangePasswordForm onSuccess={handlePasswordUpdate} />
          </div>

          {/* Device Sessions Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <DeviceSessions />
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/50 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {t('settings.themeSettings')}
            </h2>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('settings.displayMode')}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">{t('settings.displayModeDesc')}</p>

              <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`group relative overflow-hidden px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${theme === 'light'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl shadow-yellow-500/25'
                    : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600'
                    }`}
                >
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-white/20' : 'bg-yellow-100 dark:bg-yellow-900/30'
                      }`}>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base font-semibold">{t('settings.lightMode')}</span>
                  </div>
                  {theme === 'light' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  )}
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`group relative overflow-hidden px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${theme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-2xl shadow-indigo-500/25'
                    : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600'
                    }`}
                >
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/30'
                      }`}>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base font-semibold">{t('settings.darkMode')}</span>
                  </div>
                  {theme === 'dark' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Theme Preview */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('settings.themePreview')}
              </h4>
              <div className={`p-6 rounded-xl transition-all duration-300 ${theme === 'dark'
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-2xl'
                : 'bg-gradient-to-br from-white to-gray-50 text-gray-900 shadow-lg'
                }`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'dark'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                    }`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{t('settings.exampleCard')}</p>
                    <p className="text-sm opacity-80">{t('settings.exampleCardDesc')} {theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Language Selection */}
            <div className="text-center mt-6 sm:mt-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('settings.language')}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">{t('settings.languageDesc')}</p>

              <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4">
                <button
                  onClick={() => handleLanguageChange('id')}
                  className={`group relative overflow-hidden px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${language === 'id'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-2xl shadow-red-500/25'
                    : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600'
                    }`}
                >
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${language === 'id' ? 'bg-white/20' : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base font-semibold">{t('settings.indonesian')}</span>
                  </div>
                  {language === 'id' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  )}
                </button>

                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`group relative overflow-hidden px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${language === 'en'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/25'
                    : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600'
                    }`}
                >
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${language === 'en' ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base font-semibold">{t('settings.english')}</span>
                  </div>
                  {language === 'en' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/50 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {t('settings.dataManagement')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="group">
              <button
                onClick={handleExportData}
                className="w-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-lg">{t('settings.exportData')}</span>
                </div>
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">{t('settings.exportDataDesc')}</p>
            </div>

            <div className="group">
              <label className="w-full bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/25 cursor-pointer block">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="font-semibold text-lg">{t('settings.importData')}</span>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">{t('settings.importDataDesc')}</p>
            </div>

            <div className="group">
              <button
                onClick={handleClearData}
                className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-red-500/25"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <span className="font-semibold text-lg">{t('settings.clearData')}</span>
                </div>
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">{t('settings.clearDataDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
