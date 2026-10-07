import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export default function AdminCarListPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminCars();
      setCars(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (carId) => {
    try {
      const newStatus = await api.toggleCarStatus(carId);
      showToast(`Vehicle status updated to ${newStatus}.`, 'success');
      setCars((prev) =>
        prev.map((c) => (c.car_id === carId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to toggle status.', 'error');
    }
  };

  const handleDelete = async (carId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}?`)) return;
    try {
      await api.deleteCar(carId);
      showToast('Vehicle removed from fleet inventory.', 'info');
      setCars((prev) => prev.filter((c) => c.car_id !== carId));
    } catch (err) {
      console.error(err);
      showToast('Failed to delete vehicle.', 'error');
    }
  };

  const filteredCars = cars.filter(
    (c) =>
      c.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.reg_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Vehicle Fleet Management</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Total Inventory: <strong>{cars.length}</strong> vehicles registered in telematics grid
          </p>
        </div>
        <Link to="/admin-panel/cars/add" className="btn-3d btn-3d-primary btn-3d-sm">
          <i className="fas fa-plus mr-1.5"></i> Add New Vehicle
        </Link>
      </div>

      {/* Search toolbar */}
      <div className="card-3d p-4 mb-6 flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 max-w-sm w-full">
          <i className="fas fa-search text-cyan-400 text-sm"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by brand, model, registration..."
            className="input-3d py-2 text-sm"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing {filteredCars.length} of {cars.length} vehicles
        </div>
      </div>

      {/* Table */}
      <div className="table-3d-wrap">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-cyan-400">
            <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Querying fleet database...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-3d">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Reg No</th>
                  <th>Type & Seats</th>
                  <th>Daily Rate</th>
                  <th>Status</th>
                  <th>GPS Lat/Lng</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCars.map((car) => (
                  <tr key={car.car_id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 text-lg overflow-hidden shrink-0">
                          {car.image ? (
                            <img src={car.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <i className="fas fa-car-side"></i>
                          )}
                        </div>
                        <div>
                          <strong className="text-white text-sm block">
                            {car.brand} {car.model}
                          </strong>
                          <span className="text-[11px] text-slate-500 font-mono">ID: {car.car_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-cyan-400 text-xs font-semibold">{car.reg_no}</td>
                    <td className="text-xs">
                      {car.vehicle_type} &bull; {car.capacity} Seats
                    </td>
                    <td className="font-bold text-white text-sm">
                      ₹{Number(car.rent_per_day).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(car.car_id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all border ${
                          car.status === 'Available'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                            : car.status === 'Booked'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                        }`}
                        title="Click to toggle status"
                      >
                        {car.status} <i className="fas fa-arrows-rotate text-[10px] ml-1"></i>
                      </button>
                    </td>
                    <td className="text-[11px] font-mono text-slate-400">
                      {car.latitude || 23.0225}, {car.longitude || 72.5714}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin-panel/cars/${car.car_id}/edit`}
                          className="btn-3d btn-3d-glass btn-3d-sm py-1.5 px-3 text-xs"
                        >
                          <i className="fas fa-pen-to-square"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(car.car_id, `${car.brand} ${car.model}`)}
                          className="btn-3d btn-3d-danger btn-3d-sm py-1.5 px-3 text-xs cursor-pointer"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
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
