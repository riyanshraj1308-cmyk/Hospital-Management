import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
  'in-progress': 'bg-amber-100 text-amber-700',
  'no-show': 'bg-orange-100 text-orange-700',
};

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [tab, setTab] = useState('appointments');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/patients/${id}`),
      api.get(`/patients/${id}/history`),
    ]).then(([p, h]) => {
      setPatient(p.data);
      setHistory(h.data);
    }).catch(() => toast.error('Failed to load patient'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-slate-400">Loading patient...</div>;
  if (!patient) return <div className="text-center py-20 text-slate-400">Patient not found</div>;

  const tabs = [
    { id: 'appointments', label: 'Appointments', count: history?.appointments?.length },
    { id: 'records', label: 'Medical Records', count: history?.records?.length },
    { id: 'invoices', label: 'Billing', count: history?.invoices?.length },
  ];

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-primary-600 flex items-center gap-1">
        ← Back to Patients
      </button>

      {/* Patient Header */}
      <div className="card">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 font-bold text-2xl flex-shrink-0">
            {patient.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display font-bold text-2xl text-slate-900">{patient.name}</h1>
                <p className="text-slate-500 font-mono text-sm">{patient.patientId}</p>
              </div>
              <span className={`badge ${patient.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {patient.status}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
              <div><span className="text-slate-400">Age</span><p className="font-medium">{patient.age} years</p></div>
              <div><span className="text-slate-400">Gender</span><p className="font-medium">{patient.gender}</p></div>
              <div><span className="text-slate-400">Blood Group</span><p className="font-medium text-red-600">{patient.bloodGroup}</p></div>
              <div><span className="text-slate-400">Phone</span><p className="font-medium">{patient.phone}</p></div>
              {patient.email && <div><span className="text-slate-400">Email</span><p className="font-medium">{patient.email}</p></div>}
              {patient.address && <div className="col-span-2"><span className="text-slate-400">Address</span><p className="font-medium">{patient.address}</p></div>}
            </div>
          </div>
        </div>

        {/* Allergies & Conditions */}
        {(patient.allergies?.length > 0 || patient.chronicConditions?.length > 0) && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-6 flex-wrap">
            {patient.allergies?.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-1">⚠️ Allergies</p>
                <div className="flex gap-2 flex-wrap">
                  {patient.allergies.map((a, i) => <span key={i} className="badge bg-red-50 text-red-600">{a}</span>)}
                </div>
              </div>
            )}
            {patient.emergencyContact?.name && (
              <div>
                <p className="text-xs text-slate-400 mb-1">🚨 Emergency Contact</p>
                <p className="text-sm font-medium">{patient.emergencyContact.name} ({patient.emergencyContact.relation}) — {patient.emergencyContact.phone}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t.label}
            {t.count > 0 && <span className="ml-2 badge bg-slate-100 text-slate-600">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'appointments' && (
        <div className="space-y-3">
          {history?.appointments?.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No appointments found</p>
          ) : history?.appointments?.map((appt) => (
            <div key={appt._id} className="card !p-4 flex items-center gap-4">
              <div className="text-center min-w-[60px]">
                <p className="text-lg font-bold text-slate-800">{format(new Date(appt.date), 'dd')}</p>
                <p className="text-xs text-slate-400">{format(new Date(appt.date), 'MMM yyyy')}</p>
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">{appt.doctor?.name}</p>
                <p className="text-sm text-slate-500">{appt.doctor?.specialization} · {appt.timeSlot} · {appt.type}</p>
                {appt.notes && <p className="text-xs text-slate-400 mt-1">{appt.notes}</p>}
              </div>
              <span className={`badge ${STATUS_COLORS[appt.status]}`}>{appt.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'records' && (
        <div className="space-y-3">
          {history?.records?.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No medical records found</p>
          ) : history?.records?.map((rec) => (
            <div key={rec._id} className="card !p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-slate-800">Dr. {rec.doctor?.name}</p>
                  <p className="text-sm text-slate-500">{rec.doctor?.specialization} · {format(new Date(rec.visitDate), 'dd MMM yyyy')}</p>
                </div>
                <span className="font-mono text-xs text-slate-400">{rec.recordId}</span>
              </div>
              {rec.diagnosis?.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-slate-400 mb-1">Diagnosis</p>
                  <div className="flex gap-2 flex-wrap">
                    {rec.diagnosis.map((d, i) => <span key={i} className="badge bg-blue-50 text-blue-700">{d}</span>)}
                  </div>
                </div>
              )}
              {rec.prescriptions?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Prescriptions</p>
                  <div className="space-y-1">
                    {rec.prescriptions.map((rx, i) => (
                      <p key={i} className="text-sm text-slate-700">💊 {rx.medicine} — {rx.dosage}, {rx.frequency} for {rx.duration}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'invoices' && (
        <div className="space-y-3">
          {history?.invoices?.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No invoices found</p>
          ) : history?.invoices?.map((inv) => (
            <div key={inv._id} className="card !p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-slate-800">{inv.invoiceId}</p>
                <p className="text-sm text-slate-500">{format(new Date(inv.createdAt), 'dd MMM yyyy')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">₹{inv.totalAmount?.toFixed(2)}</p>
                <span className={`badge text-xs ${inv.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : inv.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                  {inv.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
