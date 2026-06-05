import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import DoctorModal from '../components/doctors/DoctorModal';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/doctors', { params: { search } });
      setDoctors(data);
    } catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleSave = async (formData) => {
    try {
      if (editDoctor) {
        await api.put(`/doctors/${editDoctor._id}`, formData);
        toast.success('Doctor updated');
      } else {
        await api.post('/doctors', formData);
        toast.success('Doctor added');
      }
      setShowModal(false);
      setEditDoctor(null);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving doctor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Doctors</h1>
          <p className="text-slate-500 text-sm mt-1">{doctors.length} doctors on staff</p>
        </div>
        <button onClick={() => { setEditDoctor(null); setShowModal(true); }} className="btn-primary">
          + Add Doctor
        </button>
      </div>

      <div className="card !p-4">
        <input className="input" placeholder="Search by name or specialization..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-48 bg-slate-100" />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No doctors found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <div key={doc._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">
                  {doc.name.replace('Dr. ', '')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{doc.name}</h3>
                  <p className="text-sm text-primary-600 font-medium">{doc.specialization}</p>
                  {doc.qualification && <p className="text-xs text-slate-400 mt-0.5">{doc.qualification}</p>}
                </div>
                <span className={`badge ${doc.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {doc.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Experience</span>
                  <span className="font-medium">{doc.experience} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Consultation Fee</span>
                  <span className="font-medium text-green-600">₹{doc.consultationFee}</span>
                </div>
                {doc.department && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department</span>
                    <span className="font-medium">{doc.department}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-medium">{doc.phone}</span>
                </div>
              </div>

              {doc.availableDays?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Available Days</p>
                  <div className="flex gap-1 flex-wrap">
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                      const full = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i];
                      const active = doc.availableDays.includes(full);
                      return (
                        <span key={day} className={`text-xs px-1.5 py-0.5 rounded font-medium ${active ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-300'}`}>
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button onClick={() => { setEditDoctor(doc); setShowModal(true); }}
                  className="text-sm text-primary-600 hover:underline">Edit Profile</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <DoctorModal doctor={editDoctor} onSave={handleSave} onClose={() => { setShowModal(false); setEditDoctor(null); }} />
      )}
    </div>
  );
}
