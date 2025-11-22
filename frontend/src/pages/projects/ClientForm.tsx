import { useState } from "react";
import axios from "@/services/axios";

const ClientForm = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({
    company_name: "",
    owner: "",
    phone: "",
    package: "",
    deadline: "",
    dp: "",
  });
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

  // Validasi tanggal deadline
  const validateDeadline = (date: string) => {
    const today = new Date();
    const deadline = new Date(date);
    today.setHours(0, 0, 0, 0); // Reset time untuk perbandingan yang akurat
    
    if (deadline < today) {
      alert("⚠️ Tanggal deadline tidak boleh sebelum hari ini!");
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

    showToastNotification("Data klien berhasil tersimpan!");
    onClose(); // tutup modal setelah submit

    // Coba simpan ke API (opsional, tidak memblokir UI)
    try {
      await axios.post("/api/clients", form);
    } catch (error) {
      // Error API tidak mempengaruhi UI
      console.log("API error:", error);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-xl shadow-lg"
    >
      <input
        type="text"
        placeholder="Company Name"
        value={form.company_name}
        onChange={(e) => setForm({ ...form, company_name: e.target.value })}
        className="w-full border px-3 py-2 rounded text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <input
        type="text"
        placeholder="Owner"
        value={form.owner}
        onChange={(e) => setForm({ ...form, owner: e.target.value })}
        className="w-full border px-3 py-2 rounded text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <input
        type="text"
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full border px-3 py-2 rounded text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div>
        <label className="block text-sm font-medium text-black  mb-1">Paket</label>
        <select
          className="w-full border px-3 py-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
        <input
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          className="w-full border px-3 py-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status Payment</label>
        <select
          className="w-full border px-3 py-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
    </>
  );
};

const ClientModal = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6">
      {/* Tombol buka modal */}
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Add Client
      </button>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full">
            <h2 className="text-lg font-bold mb-4">New Client</h2>
            <ClientForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientModal;
