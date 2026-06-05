import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import AppointmentModal from '../components/appointments/AppointmentModal';

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
  'no-show': 'bg-orange-100 text-orange-700',
};

const STATUS_LIST = ['scheduled','confirmed','in-progress','completed','cancelled','no-show'];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editAppt, setEditAppt] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments', { params: { date, status, page, limit: 15 } });
      setAppointments(data.appointments);
      setTotal(data.total);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  }, [date, status, page]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchAppointments();
    } catch { toast.error('Failed to update status'); }
  };

  const handleSave = async (formData) => {
    try {
      if (editAppt) {
        await api.put(`/appointments/${editAppt._id}`, formData);
        toast.success('Appointment updated');
      } else {
        await api.post('/appointments', formData);
        toast.success('Appointment booked');
      }
      setShowModal(false);
      setEditAppt(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving appointment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total appointments</p>
        </div>
        <button onClick={() => { setEditAppt(null); setShowModal(true); }} className="btn-primary">
          + Book Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="card !p-4 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <label className="label text-xs">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="label text-xs">Status</label>
          <select className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {(date || status) && (
          <div className="flex items-end">
            <button onClick={() => { setDate(''); setStatus(''); setPage(1); }} className="btn-secondary">Clear</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">ID</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Patient</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Doctor</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Date & Time</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Type</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}
                </tr>
              ))
            ) : appointments.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-slate-400 py-12">No appointments found</td></tr>
            ) : appointments.map((appt) => (
              <tr key={appt._id} className="table-row">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{appt.appointmentId}</td>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-800 text-sm">{appt.patient?.name}</p>
                  <p className="text-xs text-slate-400">{appt.patient?.patientId}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-800 text-sm">{appt.doctor?.name}</p>
                  <p className="text-xs text-slate-400">{appt.doctor?.specialization}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-slate-800">{format(new Date(appt.date), 'dd MMM yyyy')}</p>
                  <p className="text-xs text-slate-400">{appt.timeSlot}</p>
                </td>
                <td className="px-4 py-4">
                  <span className="badge bg-slate-100 text-slate-600 capitalize">{appt.type}</span>
                </td>
                <td className="px-4 py-4">
                  <select
                    value={appt.status}
                    onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                    className={`badge border-0 cursor-pointer text-xs font-medium ${STATUS_COLORS[appt.status]} outline-none`}
                    onClick={(e) => e.stopPropagation()}>
                    {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => { setEditAppt(appt); setShowModal(true); }}
                    className="text-slate-400 hover:text-primary-600 text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {total > 15 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">{(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm py-1.5 disabled:opacity-40">← Prev</button>
              <button disabled={page * 15 >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm py-1.5 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <AppointmentModal appointment={editAppt} onSave={handleSave} onClose={() => { setShowModal(false); setEditAppt(null); }} />
      )}
    </div>
  );
}
