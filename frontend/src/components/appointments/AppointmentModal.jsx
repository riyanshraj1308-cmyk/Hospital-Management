import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';

export default function AppointmentModal({ appointment, onSave, onClose }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm({
    defaultValues: appointment ? {
      ...appointment,
      patient: appointment.patient?._id || appointment.patient,
      doctor: appointment.doctor?._id || appointment.doctor,
      date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
    } : { type: 'consultation', status: 'scheduled' },
  });

  const watchedDoctor = watch('doctor');
  const watchedDate = watch('date');

  useEffect(() => {
    Promise.all([
      api.get('/patients', { params: { limit: 200 } }),
      api.get('/doctors', { params: { isActive: true } }),
    ]).then(([p, d]) => {
      setPatients(p.data.patients);
      setDoctors(d.data);
    });
  }, []);

  useEffect(() => {
    if (watchedDoctor && watchedDate) {
      setLoadingSlots(true);
      api.get(`/doctors/${watchedDoctor}/available-slots`, { params: { date: watchedDate } })
        .then(({ data }) => setAvailableSlots(data.availableSlots || []))
        .catch(() => setAvailableSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [watchedDoctor, watchedDate]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-display font-semibold text-xl text-slate-900">
            {appointment ? 'Edit Appointment' : 'Book Appointment'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <div>
            <label className="label">Patient *</label>
            <select {...register('patient', { required: true })} className="input">
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
            </select>
          </div>

          <div>
            <label className="label">Doctor *</label>
            <select {...register('doctor', { required: true })} className="input">
              <option value="">Select doctor...</option>
              {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date *</label>
              <input type="date" {...register('date', { required: true })}
                min={new Date().toISOString().split('T')[0]} className="input" />
            </div>
            <div>
              <label className="label">Time Slot *</label>
              {loadingSlots ? (
                <div className="input text-slate-400 text-sm">Loading slots...</div>
              ) : (
                <select {...register('timeSlot', { required: true })} className="input">
                  <option value="">Select slot...</option>
                  {availableSlots.length === 0 && watchedDoctor && watchedDate ? (
                    <option disabled>No slots available</option>
                  ) : (
                    availableSlots.map(s => <option key={s} value={s}>{s}</option>)
                  )}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select {...register('type')} className="input">
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="procedure">Procedure</option>
                <option value="lab-visit">Lab Visit</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Fee (₹)</label>
            <input type="number" {...register('fee')} className="input" placeholder="500" />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea {...register('notes')} className="input resize-none" rows={3} placeholder="Reason for visit, symptoms..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving...' : appointment ? 'Update Appointment' : 'Book Appointment'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
