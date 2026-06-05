import { useForm } from 'react-hook-form';

export default function PaymentModal({ invoice, onSave, onClose }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      amountPaid: invoice.balance || invoice.totalAmount,
      paymentMethod: 'cash',
    },
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-display font-semibold text-xl text-slate-900">Record Payment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Invoice Summary */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice</span>
              <span className="font-mono">{invoice.invoiceId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Patient</span>
              <span className="font-medium">{invoice.patient?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Amount</span>
              <span className="font-bold">₹{invoice.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Already Paid</span>
              <span className="text-green-600">₹{invoice.amountPaid?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-slate-200 pt-2 mt-2">
              <span>Balance Due</span>
              <span className="text-red-600">₹{(invoice.balance || 0).toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div>
              <label className="label">Amount Received (₹) *</label>
              <input type="number" step="0.01" {...register('amountPaid', { required: true, min: 0.01 })}
                className="input text-lg font-bold" />
            </div>
            <div>
              <label className="label">Payment Method *</label>
              <select {...register('paymentMethod', { required: true })} className="input">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="insurance">Insurance</option>
                <option value="bank-transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                {isSubmitting ? 'Processing...' : '✓ Confirm Payment'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
