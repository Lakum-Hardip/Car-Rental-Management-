import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminPaymentListPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await api.getAdminPayments();
        setPayments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Payment Audit Ledger</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Immutable settlement log of all completed rental transactions
          </p>
        </div>
      </div>

      <div className="table-3d-wrap">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-cyan-400">
            <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Querying payment ledger...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-3d">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Amount Settled</th>
                  <th>Channel / Method</th>
                  <th>Settlement Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.payment_id}>
                    <td className="font-mono text-cyan-400 font-bold">#PAY-{p.payment_id}</td>
                    <td className="font-mono text-slate-300">#VEL-{p.booking_id}</td>
                    <td className="font-semibold text-white">{p.customer_name || 'Driver'}</td>
                    <td>{p.vehicle || 'Fleet Car'}</td>
                    <td className="font-extrabold text-white text-sm">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 px-2.5 py-1 rounded text-xs font-semibold">
                        <i
                          className={`fas ${
                            p.method === 'Card'
                              ? 'fa-credit-card'
                              : p.method === 'Online'
                              ? 'fa-mobile-screen'
                              : 'fa-money-bill-1'
                          } mr-1`}
                        />
                        {p.method}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400 font-mono">{p.payment_date}</td>
                    <td>
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1 w-max">
                        <i className="fas fa-shield-check"></i> Cleared
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
