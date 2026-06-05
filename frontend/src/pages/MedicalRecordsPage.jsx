import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import RecordModal from '../components/records/RecordModal';

export default function MedicalRecordsPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get('/patients', { params: { limit: 200 } }).then(({ data }) => setPatients(data.patients));
  }, []);

  const fetchRecords = useCallback(async () => {
    if (!selectedPatient) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/records/${selectedPatient}`);
      setRecords(data);
    } catch { toast.error('Failed to load records'); }
    finally { setLoading(false); }
  }, [selectedPatient]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleSave = async (formData) => {
    try {
      if (editRecord) {
        await api.put(`/records/${editRecord._id}`, formData);
        toast.success('Record updated');
      } else {
        await api.post('/records', { ...formData, patient: selectedPatient });
        toast.success('Record created');
      }
      setShowModal(false);
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving record');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
      await api.delete(`/records/${id}`);
      toast.success('Record deleted');
      fetchRecords();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Medical Records</h1>
          <p className="text-slate-500 text-sm mt-1">Patient visit history and prescriptions</p>
        </div>
        <button
          disabled={!selectedPatient}
          onClick={() => { setEditRecord(null); setShowModal(true); }}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
          + New Record
        </button>
      </div>

      {/* Patient selector */}
      <div className="card !p-4">
        <label className="label">Select Patient</label>
        <select className="input" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
          <option value="">Choose a patient to view records...</option>
          {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
        </select>
      </div>

      {/* Records */}
      {!selectedPatient ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-3">🗂️</div>
          <p>Select a patient to view their medical records</p>
        </div>
      ) : loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-24 bg-slate-100" />)}</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No medical records found for this patient</div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <div key={rec._id} className="card">
              <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === rec._id ? null : rec._id)}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">🗂️</div>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-slate-900">Dr. {rec.doctor?.name}</p>
                      <span className="font-mono text-xs text-slate-400">{rec.recordId}</span>
                    </div>
                    <p className="text-sm text-slate-500">{rec.doctor?.specialization} · {format(new Date(rec.visitDate), 'dd MMM yyyy')}</p>
                    {rec.diagnosis?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {rec.diagnosis.map((d, i) => <span key={i} className="badge bg-blue-50 text-blue-700">{d}</span>)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setEditRecord(rec); setShowModal(true); }}
                    className="text-xs text-primary-600 hover:underline">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(rec._id); }}
                    className="text-xs text-red-500 hover:underline">Delete</button>
                  <span className="text-slate-400 text-sm">{expandedId === rec._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expandedId === rec._id && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fade-in">
                  {/* Vital Signs */}
                  {rec.vitalSigns && Object.values(rec.vitalSigns).some(Boolean) && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Vital Signs</p>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {rec.vitalSigns.bloodPressure && <div className="text-center bg-slate-50 rounded-lg p-2"><p className="text-xs text-slate-400">BP</p><p className="font-bold text-sm">{rec.vitalSigns.bloodPressure}</p></div>}
                        {rec.vitalSigns.heartRate && <div className="text-center bg-slate-50 rounded-lg p-2"><p className="text-xs text-slate-400">Heart Rate</p><p className="font-bold text-sm">{rec.vitalSigns.heartRate} bpm</p></div>}
                        {rec.vitalSigns.temperature && <div className="text-center bg-slate-50 rounded-lg p-2"><p className="text-xs text-slate-400">Temp</p><p className="font-bold text-sm">{rec.vitalSigns.temperature}°C</p></div>}
                        {rec.vitalSigns.weight && <div className="text-center bg-slate-50 rounded-lg p-2"><p className="text-xs text-slate-400">Weight</p><p className="font-bold text-sm">{rec.vitalSigns.weight} kg</p></div>}
                        {rec.vitalSigns.oxygenSaturation && <div className="text-center bg-slate-50 rounded-lg p-2"><p className="text-xs text-slate-400">SpO2</p><p className="font-bold text-sm">{rec.vitalSigns.oxygenSaturation}%</p></div>}
                      </div>
                    </div>
                  )}

                  {/* Prescriptions */}
                  {rec.prescriptions?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Prescriptions</p>
                      <div className="space-y-2">
                        {rec.prescriptions.map((rx, i) => (
                          <div key={i} className="flex items-start gap-3 bg-green-50 rounded-lg p-3">
                            <span className="text-lg">💊</span>
                            <div className="text-sm">
                              <p className="font-semibold text-slate-800">{rx.medicine} — {rx.dosage}</p>
                              <p className="text-slate-500">{rx.frequency} · {rx.duration}</p>
                              {rx.instructions && <p className="text-slate-400 text-xs mt-1">{rx.instructions}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor Notes */}
                  {rec.doctorNotes && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Doctor Notes</p>
                      <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{rec.doctorNotes}</p>
                    </div>
                  )}

                  {rec.followUpDate && (
                    <p className="text-sm text-amber-600 font-medium">
                      📅 Follow-up: {format(new Date(rec.followUpDate), 'dd MMM yyyy')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <RecordModal record={editRecord} patientId={selectedPatient} onSave={handleSave} onClose={() => { setShowModal(false); setEditRecord(null); }} />
      )}
    </div>
  );
}
