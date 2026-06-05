import { useForm } from 'react-hook-form';

export default function PatientModal({ patient, onSave, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: patient || { gender: 'Male', bloodGroup: 'Unknown', status: 'active' },
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-display font-semibold text-xl text-slate-900">
            {patient ? 'Edit Patient' : 'Register Patient'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input {...register('name', { required: 'Name is required' })} className="input" placeholder="Rahul Verma" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Age *</label>
              <input type="number" {...register('age', { required: true, min: 0, max: 150 })} className="input" placeholder="30" />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select {...register('gender')} className="input">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Phone *</label>
              <input {...register('phone', { required: 'Phone is required' })} className="input" placeholder="+91-9XXXXXXXXX" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" {...register('email')} className="input" placeholder="patient@email.com" />
            </div>
            <div>
              <label className="label">Blood Group</label>
              <select {...register('bloodGroup')} className="input">
                {['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option>active</option><option>inactive</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Address</label>
              <input {...register('address')} className="input" placeholder="Full address" />
            </div>
            <div className="col-span-2">
              <label className="label">Allergies (comma-separated)</label>
              <input {...register('allergies')} className="input" placeholder="Penicillin, Dust, Pollen" />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <p className="font-medium text-slate-700 text-sm mb-3">Emergency Contact</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Name</label>
                <input {...register('emergencyContact.name')} className="input" placeholder="Contact name" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input {...register('emergencyContact.phone')} className="input" placeholder="+91-XXXXXXXXXX" />
              </div>
              <div>
                <label className="label">Relation</label>
                <input {...register('emergencyContact.relation')} className="input" placeholder="Spouse, Parent..." />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving...' : patient ? 'Update Patient' : 'Register Patient'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
