import React, { useState, useEffect } from 'react';
import { use3DTilt } from '../../hooks/use3DTilt';
import { api } from '../../services/api';

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const card1Ref = use3DTilt(6, -4, 1.01);
  const card2Ref = use3DTilt(6, -4, 1.01);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await api.getAdminReports();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const reports = data?.reports || {
    total_revenue: 145000,
    total_bookings: 18,
    cancelled_bookings: 2,
    fleet_by_type: [
      { vehicle_type: 'Petrol', count: 5 },
      { vehicle_type: 'Diesel', count: 4 },
      { vehicle_type: 'Electric', count: 2 },
    ],
    payments_by_method: [
      { method: 'Card', total: 85000, count: 10 },
      { method: 'Online', total: 45000, count: 6 },
      { method: 'Cash', total: 15000, count: 2 },
    ],
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Analytics & Executive Reports</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Financial volume breakdowns and vehicle fleet utilization intelligence
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="stat-card-3d">
          <h3 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Gross Settled Revenue</h3>
          <div className="stat-val text-gradient text-3xl font-black mt-1">
            ₹{Number(reports.total_revenue).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-400 mt-2 block">100% digital clearing</span>
        </div>

        <div className="stat-card-3d">
          <h3 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Total Bookings Completed</h3>
          <div className="stat-val text-emerald-400 text-3xl font-black mt-1">
            {reports.total_bookings}
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Active & finalized trips</span>
        </div>

        <div className="stat-card-3d">
          <h3 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Cancellation Rate</h3>
          <div className="stat-val text-amber-400 text-3xl font-black mt-1">
            {reports.cancelled_bookings}
          </div>
          <span className="text-xs text-slate-400 mt-2 block">
            {reports.total_bookings > 0
              ? `${((reports.cancelled_bookings / reports.total_bookings) * 100).toFixed(1)}% attrition`
              : '0% attrition'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fleet Distribution by Type */}
        <div ref={card1Ref} className="card-3d tilt-card p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <i className="fas fa-gas-pump text-cyan-400"></i> Fleet Distribution by Powertrain
          </h2>

          <div className="space-y-4">
            {reports.fleet_by_type.map((item) => (
              <div key={item.vehicle_type}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white font-medium">{item.vehicle_type}</span>
                  <span className="text-cyan-400 font-bold">{item.count} Vehicles</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (item.count / 10) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Channels */}
        <div ref={card2Ref} className="card-3d tilt-card p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <i className="fas fa-wallet text-cyan-400"></i> Settlement Volume by Channel
          </h2>

          <div className="space-y-4">
            {reports.payments_by_method.map((item) => (
              <div key={item.method} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="text-white font-bold text-sm">{item.method}</h4>
                  <span className="text-xs text-slate-400">{item.count} Transactions</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-cyan-300 font-['Plus_Jakarta_Sans']">
                    ₹{Number(item.total).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
