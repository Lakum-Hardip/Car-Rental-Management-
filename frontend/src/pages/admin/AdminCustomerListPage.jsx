import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function AdminCustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await api.getAdminCustomers();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Driver Database</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Registered customer profiles and verified licensing credentials
          </p>
        </div>
      </div>

      <div className="table-3d-wrap">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-cyan-400">
            <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Querying customer database...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-3d">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>License Number</th>
                  <th>Total Reservations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.customer_id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-cyan-500/15 text-cyan-300 font-bold flex items-center justify-center text-sm border border-cyan-500/30">
                          {c.name ? c.name[0].toUpperCase() : 'D'}
                        </div>
                        <div>
                          <strong className="text-white text-sm block">{c.name}</strong>
                          <span className="text-[11px] text-slate-500 font-mono">ID: {c.customer_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-300 text-sm">{c.email}</td>
                    <td className="text-slate-300 text-sm font-mono">{c.phone_no}</td>
                    <td className="font-mono text-cyan-400 text-xs font-semibold">{c.license_no}</td>
                    <td>
                      <span className="bg-white/[0.06] text-white px-2.5 py-1 rounded-full text-xs font-bold">
                        {c.bookings_count || 1} Trips
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/admin-panel/customers/${c.customer_id}`}
                        className="btn-3d btn-3d-glass btn-3d-sm py-1.5 px-3 text-xs"
                      >
                        <i className="fas fa-eye mr-1"></i> View Profile
                      </Link>
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
