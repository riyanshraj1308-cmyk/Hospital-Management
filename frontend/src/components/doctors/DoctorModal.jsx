import { useForm, Controller } from 'react-hook-form';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

export default function DoctorModal({ doctor, onSave, onClose }) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: doctor ? {
      ...doctor,
      availableDays: doctor.availableDays || [],
      availableSlots: doctor.availableSlots || [],
    } : { isActive: true, consultationFee: 500, experience: 0, availableDays: [], availableSlots: [] },
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-display font-semibold text-xl text-slate-900">
            {doctor ? 'Edit Doctor' : 'Add Doctor'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input {...register('name', { required: true })} className="input" placeholder="Dr. Arjun Sharma" />
            </div>
            <div>
              <label className="label">Specialization *</label>
              <input {...register('specialization', { required: true })} className="input" placeholder="Cardiology" />
            </div>
            <div>
              <label className="label">Department</label>
              <input {...register('department')} className="input" placeholder="Cardiology" />
            </div>
            <div>
              <label className="label">Qualification</label>
              <input {...register('qualification')} className="input" placeholder="MBBS, MD" />
            </div>
            <div>
              <label className="label">Experience (years)</label>
              <input type="number" {...register('experience')} className="input" placeholder="5" />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input {...register('phone', { required: true })} className="input" placeholder="+91-XXXXXXXXXX" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" {...register('email', { required: true })} className="input" placeholder="doctor@medicore.com" />
            </div>
            <div>
              <label className="label">Consultation Fee (₹)</label>
              <input type="number" {...register('consultationFee')} className="input" placeholder="500" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register('isActive')} id="isActive" className="w-4 h-4 rounded" />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</label>
            </div>
          </div>

          {/* Available Days */}
          <div>
            <label className="label">Available Days</label>
            <Controller
              name="availableDays"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2 flex-wrap mt-1">
                  {DAYS.map((day) => (
                    <button type="button" key={day}
                      onClick={() => {
                        const curr = field.value || [];
                        field.onChange(curr.includes(day) ? curr.filter(d => d !== day) : [...curr, day]);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        (field.value || []).includes(day)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                      }`}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Available Time Slots */}
          <div>
            <label className="label">Available Time Slots</label>
            <Controller
              name="availableSlots"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2 flex-wrap mt-1">
                  {SLOTS.map((slot) => (
                    <button type="button" key={slot}
                      onClick={() => {
                        const curr = field.value || [];
                        field.onChange(curr.includes(slot) ? curr.filter(s => s !== slot) : [...curr, slot]);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        (field.value || []).includes(slot)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                      }`}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving...' : doctor ? 'Update Doctor' : 'Add Doctor'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
