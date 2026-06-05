import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import InvoiceModal from '../components/billing/InvoiceModal';
import PaymentModal from '../components/billing/PaymentModal';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  partial: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, s] = await Promise.all([
        api.get('/billing', { params: { status, page, limit: 10 } }),
        api.get('/billing/stats'),
      ]);
      setInvoices(inv.data.invoices);
      setTotal(inv.data.total);
      setStats(s.data);
    } catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleSaveInvoice = async (formData) => {
    try {
      await api.post('/billing/invoice', formData);
      toast.success('Invoice created');
      setShowInvoiceModal(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating invoice');
    }
  };

  const handleRecordPayment = async ({ amountPaid, paymentMethod }) => {
    try {
      await api.put(`/billing/${selectedInvoice._id}/pay`, { amountPaid: Number(amountPaid), paymentMethod });
      toast.success('Payment recorded');
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch { toast.error('Failed to record payment'); }
  };

  const totalRevenue = stats?.totalRevenue || 0;
  const pendingCount = stats?.stats?.find(s => s._id === 'pending')?.count || 0;
  const overdueCount = stats?.stats?.find(s => s._id === 'overdue')?.count || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Billing</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total invoices</p>
        </div>
        <button onClick={() => setShowInvoiceModal(true)} className="btn-primary">+ New Invoice</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">💰</div>
          <div>
            <p className="text-sm text-slate-500">Total Revenue</p>
            <p className="text-2xl font-display font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">⏳</div>
          <div>
            <p className="text-sm text-slate-500">Pending Invoices</p>
            <p className="text-2xl font-display font-bold text-slate-900">{pendingCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🚨</div>
          <div>
            <p className="text-sm text-slate-500">Overdue</p>
            <p className="text-2xl font-display font-bold text-slate-900">{overdueCount}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card !p-4 flex gap-4">
        <div className="flex-1">
          <label className="label text-xs">Filter by Status</label>
          <select className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Invoice</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Patient</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Date</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">Total</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">Paid</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">Balance</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}
                </tr>
              ))
            ) : invoices.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-slate-400 py-12">No invoices found</td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv._id} className="table-row">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{inv.invoiceId}</td>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-800 text-sm">{inv.patient?.name}</p>
                  <p className="text-xs text-slate-400">{inv.patient?.patientId}</p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{format(new Date(inv.createdAt), 'dd MMM yyyy')}</td>
                <td className="px-4 py-4 text-right font-medium text-slate-800">₹{inv.totalAmount?.toFixed(2)}</td>
                <td className="px-4 py-4 text-right text-green-600 font-medium">₹{inv.amountPaid?.toFixed(2)}</td>
                <td className="px-4 py-4 text-right font-medium text-red-600">₹{(inv.balance || 0).toFixed(2)}</td>
                <td className="px-4 py-4">
                  <span className={`badge ${STATUS_COLORS[inv.paymentStatus]}`}>{inv.paymentStatus}</span>
                </td>
                <td className="px-4 py-4">
                  {inv.paymentStatus !== 'paid' && inv.paymentStatus !== 'cancelled' && (
                    <button onClick={() => { setSelectedInvoice(inv); setShowPaymentModal(true); }}
                      className="text-xs text-primary-600 hover:underline whitespace-nowrap">
                      Record Payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {total > 10 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">{(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm py-1.5 disabled:opacity-40">← Prev</button>
              <button disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm py-1.5 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {showInvoiceModal && (
        <InvoiceModal onSave={handleSaveInvoice} onClose={() => setShowInvoiceModal(false)} />
      )}
      {showPaymentModal && selectedInvoice && (
        <PaymentModal invoice={selectedInvoice} onSave={handleRecordPayment} onClose={() => { setShowPaymentModal(false); setSelectedInvoice(null); }} />
      )}
    </div>
  );
}
