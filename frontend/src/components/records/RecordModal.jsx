import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../utils/api';

export default function RecordModal({ record, patientId, onSave, onClose }) {
  const [doctors, setDoctors] = useState([]);

  const { register, handleSubmit, control, formState: { isSubmitting } } = useForm({
    defaultValues: record || {
      prescriptions: [{ medicine: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      diagnosis: '',
      symptoms: '',
      vitalSigns: {},
    },
  });

  const { fields: rxFields, append: addRx, remove: removeRx } = useFieldArray({ control, name: 'prescriptions' });

  useEffect(() => {
    api.get('/doctors', { params: { isActive: true } }).then(({ data }) => setDoctors(data));
  }, []);

  const handleSubmitForm = (data) => {
    // Convert comma-separated strings to arrays
    const formData = {
      ...data,
      patient: patientId,
      diagnosis: typeof data.diagnosis === 'string' ? data.diagnosis.split(',').map(s => s.trim()).filter(Boolean) : data.diagnosis,
      symptoms: typeof data.symptoms === 'string' ? data.symptoms.split(',').map(s => s.trim()).filter(Boolean) : data.symptoms,
    };
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-display font-semibold text-xl text-slate-900">
            {record ? 'Edit Medical Record' : 'New Medical Record'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(handleSubmitForm)} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Doctor *</label>
              <select {...register('doctor', { required: true })} className="input">
                <option value="">Select doctor...</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Visit Date</label>
              <input type="date" {...register('visitDate')} className="input"
                defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <div>
            <label className="label">Chief Complaint</label>
            <input {...register('chiefComplaint')} className="input" placeholder="Main reason for visit" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Diagnosis (comma-separated)</label>
              <input {...register('diagnosis')} className="input" placeholder="Hypertension, Diabetes" />
            </div>
            <div>
              <label className="label">Symptoms (comma-separated)</label>
              <input {...register('symptoms')} className="input" placeholder="Headache, Fatigue" />
            </div>
          </div>

          {/* Vital Signs */}
          <div>
            <p className="font-medium text-slate-700 text-sm mb-3">Vital Signs</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label text-xs">Blood Pressure</label>
                <input {...register('vitalSigns.bloodPressure')} className="input" placeholder="120/80" />
              </div>
              <div>
                <label className="label text-xs">Heart Rate (bpm)</label>
                <input type="number" {...register('vitalSigns.heartRate')} className="input" placeholder="72" />
              </div>
              <div>
                <label className="label text-xs">Temperature (°C)</label>
                <input type="number" step="0.1" {...register('vitalSigns.temperature')} className="input" placeholder="37.0" />
              </div>
              <div>
                <label className="label text-xs">Weight (kg)</label>
                <input type="number" {...register('vitalSigns.weight')} className="input" placeholder="70" />
              </div>
              <div>
                <label className="label text-xs">Height (cm)</label>
                <input type="number" {...register('vitalSigns.height')} className="input" placeholder="170" />
              </div>
              <div>
                <label className="label text-xs">SpO2 (%)</label>
                <input type="number" {...register('vitalSigns.oxygenSaturation')} className="input" placeholder="98" />
              </div>
            </div>
          </div>

          {/* Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-slate-700 text-sm">Prescriptions</p>
              <button type="button" onClick={() => addRx({ medicine: '', dosage: '', frequency: '', duration: '' })}
                className="text-xs text-primary-600 hover:underline">+ Add Medicine</button>
            </div>
            <div className="space-y-3">
              {rxFields.map((field, index) => (
                <div key={field.id} className="bg-slate-50 rounded-xl p-3 grid grid-cols-4 gap-2">
                  <input {...register(`prescriptions.${index}.medicine`)} className="input col-span-2 bg-white" placeholder="Medicine name" />
                  <input {...register(`prescriptions.${index}.dosage`)} className="input bg-white" placeholder="Dosage (500mg)" />
                  <div className="flex gap-1">
                    <input {...register(`prescriptions.${index}.frequency`)} className="input bg-white flex-1" placeholder="Frequency" />
                    {rxFields.length > 1 && (
                      <button type="button" onClick={() => removeRx(index)} className="text-red-400 hover:text-red-600 px-1">×</button>
                    )}
                  </div>
                  <input {...register(`prescriptions.${index}.duration`)} className="input bg-white" placeholder="Duration" />
                  <input {...register(`prescriptions.${index}.instructions`)} className="input col-span-3 bg-white" placeholder="Instructions (take with food, etc.)" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Follow-up Date</label>
            <input type="date" {...register('followUpDate')} className="input" />
          </div>

          <div>
            <label className="label">Doctor Notes</label>
            <textarea {...register('doctorNotes')} className="input resize-none" rows={3} placeholder="Additional notes..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving...' : record ? 'Update Record' : 'Create Record'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
