import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import PatientModal from '../components/patients/PatientModal';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-slate-100 text-slate-500',
};

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const navigate = useNavigate();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/patients', { params: { search, page, limit: 10 } });
      setPatients(data.patients);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleSave = async (formData) => {
    try {
      if (editPatient) {
        await api.put(`/patients/${editPatient._id}`, formData);
        toast.success('Patient updated');
      } else {
        await api.post('/patients', formData);
        toast.success('Patient registered');
      }
      setShowModal(false);
      setEditPatient(null);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving patient');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total patients registered</p>
        </div>
        <button onClick={() => { setEditPatient(null); setShowModal(true); }} className="btn-primary">
          + Register Patient
        </button>
      </div>

      {/* Search */}
      <div className="card !p-4">
        <input
          type="text"
          className="input"
          placeholder="Search by name, ID, phone or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Patient</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">ID</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Age / Gender</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Contact</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Blood</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : patients.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-slate-400 py-12">No patients found</td></tr>
            ) : (
              patients.map((p) => (
                <tr key={p._id} className="table-row cursor-pointer" onClick={() => navigate(`/patients/${p._id}`)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">{p.name[0]}</div>
                      <span className="font-medium text-slate-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-slate-500">{p.patientId}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{p.age}y / {p.gender}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{p.phone}</td>
                  <td className="px-4 py-4">
                    <span className="badge bg-red-50 text-red-600">{p.bloodGroup}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`badge ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setEditPatient(p); setShowModal(true); }}
                      className="text-slate-400 hover:text-primary-600 text-sm px-2">Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {total > 10 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm py-1.5 disabled:opacity-40">← Prev</button>
              <button disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm py-1.5 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <PatientModal
          patient={editPatient}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditPatient(null); }}
        />
      )}
    </div>
  );
}
