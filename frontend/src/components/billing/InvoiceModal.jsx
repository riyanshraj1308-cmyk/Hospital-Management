import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../utils/api';

export default function InvoiceModal({ onSave, onClose }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const { register, handleSubmit, control, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      items: [{ description: 'Consultation Fee', quantity: 1, unitPrice: 500, total: 500 }],
      discount: 0,
      tax: 18,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');
  const discount = watch('discount') || 0;
  const tax = watch('tax') || 18;

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);
  const discountAmt = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmt;
  const taxAmt = (afterDiscount * tax) / 100;
  const total = afterDiscount + taxAmt;

  useEffect(() => {
    Promise.all([
      api.get('/patients', { params: { limit: 200 } }),
      api.get('/doctors', { params: { isActive: true } }),
    ]).then(([p, d]) => {
      setPatients(p.data.patients);
      setDoctors(d.data);
    });
  }, []);

  const handleSubmitForm = (data) => {
    const processedItems = data.items.map(item => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.quantity) * Number(item.unitPrice),
    }));
    onSave({ ...data, items: processedItems });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-display font-semibold text-xl text-slate-900">New Invoice</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(handleSubmitForm)} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Patient *</label>
              <select {...register('patient', { required: true })} className="input">
                <option value="">Select patient...</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Doctor</label>
              <select {...register('doctor')} className="input">
                <option value="">Select doctor (optional)</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-slate-700 text-sm">Invoice Items</p>
              <button type="button" onClick={() => append({ description: '', quantity: 1, unitPrice: 0, total: 0 })}
                className="text-xs text-primary-600 hover:underline">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                  <input {...register(`items.${i}.description`)} className="input col-span-5" placeholder="Description" />
                  <input type="number" {...register(`items.${i}.quantity`)} className="input col-span-2" placeholder="Qty" min="1" />
                  <input type="number" {...register(`items.${i}.unitPrice`)} className="input col-span-3" placeholder="Unit Price" />
                  <div className="col-span-1 text-sm text-slate-600 font-medium text-right">
                    ₹{((Number(items[i]?.quantity) || 0) * (Number(items[i]?.unitPrice) || 0)).toFixed(0)}
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(i)} className="col-span-1 text-red-400 hover:text-red-600">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Discount (%)</label>
              <input type="number" {...register('discount')} className="input" min="0" max="100" />
            </div>
            <div>
              <label className="label">GST Tax (%)</label>
              <input type="number" {...register('tax')} className="input" min="0" />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({discount}%)</span><span>-₹{discountAmt.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">GST ({tax}%)</span><span>₹{taxAmt.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-slate-200 pt-2 mt-2">
              <span>Total</span><span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea {...register('notes')} className="input resize-none" rows={2} placeholder="Additional notes..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
