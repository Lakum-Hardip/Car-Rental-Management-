import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export default function AdminMaintenanceListPage() {
  const [maintenance, setMaintenance] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    car_id: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    description: '',
    cost: 2500,
    status: 'Scheduled',
  });
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mList, cList] = await Promise.all([
        api.getAdminMaintenance(),
        api.getAdminCars(),
      ]);
      setMaintenance(mList);
      setCars(cList);
      if (cList.length > 0 && !formData.car_id) {
        setFormData((prev) => ({ ...prev, car_id: cList[0].car_id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addMaintenance(formData);
      showToast('Maintenance service logged successfully.', 'success');
      setShowAddModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to log service record.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Garage & Vehicle Maintenance</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Track garage overhauls, routine service schedules, and repair ledger
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-3d btn-3d-primary btn-3d-sm cursor-pointer"
        >
          <i className="fas fa-plus mr-1.5"></i> Log Maintenance Service
        </button>
      </div>

      <div className="table-3d-wrap">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-cyan-400">
            <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Loading service records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-3d">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Scheduled Date</th>
                  <th>Completion Date</th>
                  <th>Work Description</th>
                  <th>Estimated Cost</th>
                  <th>Service Status</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.map((m) => (
                  <tr key={m.id}>
                    <td className="font-semibold text-white">{m.vehicle}</td>
                    <td className="font-mono text-xs text-slate-400">{m.scheduled_date}</td>
                    <td className="font-mono text-xs text-slate-400">
                      {m.completed_date || 'Pending Final Signoff'}
                    </td>
                    <td className="text-sm text-slate-300 max-w-xs">{m.description}</td>
                    <td className="font-bold text-white text-sm">
                      ₹{Number(m.cost).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          m.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : m.status === 'In Progress'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for adding maintenance service */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="card-3d p-7 max-w-lg w-full border-cyan-500/40">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-white">Log Vehicle Service</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-none text-lg"
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="form-group-3d">
                <label>Select Fleet Vehicle *</label>
                <select
                  value={formData.car_id}
                  onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                  className="input-3d"
                  required
                >
                  {cars.map((c) => (
                    <option key={c.car_id} value={c.car_id}>
                      {c.brand} {c.model} ({c.reg_no})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group-3d">
                  <label>Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="input-3d"
                  />
                </div>
                <div className="form-group-3d">
                  <label>Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="input-3d"
                  />
                </div>
              </div>

              <div className="form-group-3d">
                <label>Service Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Brake pad inspection, synthetic oil change..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-3d"
                />
              </div>

              <div className="form-group-3d">
                <label>Current Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-3d"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress (Marks Vehicle In Garage)</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-3d btn-3d-glass flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-3d btn-3d-primary flex-1"
                >
                  {submitting ? 'Saving...' : 'Register Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
