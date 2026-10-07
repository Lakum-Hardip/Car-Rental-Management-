import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { use3DTilt } from '../hooks/use3DTilt';
import { api } from '../services/api';

export default function CarListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const locationParam = searchParams.get('location') || '';
  const startDateParam = searchParams.get('start_date') || '';
  const endDateParam = searchParams.get('end_date') || '';
  const carTypeParam = searchParams.get('car_type') || '';

  const [formFilter, setFormFilter] = useState({
    location: locationParam,
    start_date: startDateParam,
    end_date: endDateParam,
    car_type: carTypeParam,
  });

  const filterCardRef = use3DTilt(6, -4, 1.01);

  useEffect(() => {
    setFormFilter({
      location: locationParam,
      start_date: startDateParam,
      end_date: endDateParam,
      car_type: carTypeParam,
    });

    async function loadFilteredCars() {
      setLoading(true);
      try {
        const params = {};
        if (locationParam) params.location = locationParam;
        if (startDateParam) params.start_date = startDateParam;
        if (endDateParam) params.end_date = endDateParam;
        if (carTypeParam) params.car_type = carTypeParam;

        const results = await api.getCars(params);
        setCars(results);
      } catch (err) {
        console.error('Failed to load cars:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFilteredCars();
  }, [locationParam, startDateParam, endDateParam, carTypeParam]);

  const handleApply = (e) => {
    e.preventDefault();
    const newParams = {};
    if (formFilter.location) newParams.location = formFilter.location;
    if (formFilter.start_date) newParams.start_date = formFilter.start_date;
    if (formFilter.end_date) newParams.end_date = formFilter.end_date;
    if (formFilter.car_type) newParams.car_type = formFilter.car_type;
    setSearchParams(newParams);
  };

  const handleClear = () => {
    setFormFilter({ location: '', start_date: '', end_date: '', car_type: '' });
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(locationParam || startDateParam || endDateParam || carTypeParam);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <div className="hero-badge mb-2">
            <i className="fas fa-layer-group"></i> Real-Time Inventory
          </div>
          <h1 className="text-4xl font-extrabold text-white">Available Vehicles</h1>
          <p className="text-slate-400 mt-2">
            {hasActiveFilters
              ? 'Showing results matching your custom filter criteria.'
              : 'Explore our full line-up of sanitized, telematics-enabled performance fleet.'}
          </p>
        </div>

        {hasActiveFilters && (
          <button onClick={handleClear} className="btn-3d btn-3d-glass btn-3d-sm">
            <i className="fas fa-xmark mr-1"></i> Clear Filters
          </button>
        )}
      </div>

      {/* Filter Toolbar in 3D Card */}
      <div ref={filterCardRef} className="card-3d tilt-card mb-10 p-6 border-cyan-500/20">
        <form onSubmit={handleApply}>
          <div className="search-grid-inputs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="form-group-3d">
              <label>
                <i className="fas fa-location-dot text-cyan-400"></i> Location
              </label>
              <input
                type="text"
                placeholder="City (e.g. Ahmedabad)"
                value={formFilter.location}
                onChange={(e) => setFormFilter({ ...formFilter, location: e.target.value })}
                className="input-3d"
              />
            </div>

            <div className="form-group-3d">
              <label>
                <i className="fas fa-calendar-alt text-cyan-400"></i> Pick-up
              </label>
              <input
                type="date"
                min={today}
                value={formFilter.start_date}
                onChange={(e) => setFormFilter({ ...formFilter, start_date: e.target.value })}
                className="input-3d"
              />
            </div>

            <div className="form-group-3d">
              <label>
                <i className="fas fa-calendar-check text-cyan-400"></i> Return
              </label>
              <input
                type="date"
                min={formFilter.start_date || today}
                value={formFilter.end_date}
                onChange={(e) => setFormFilter({ ...formFilter, end_date: e.target.value })}
                className="input-3d"
              />
            </div>

            <div className="form-group-3d">
              <label>
                <i className="fas fa-car text-cyan-400"></i> Brand or Type
              </label>
              <input
                type="text"
                placeholder="e.g. SUV, Tata, Creta"
                value={formFilter.car_type}
                onChange={(e) => setFormFilter({ ...formFilter, car_type: e.target.value })}
                className="input-3d"
              />
            </div>

            <div>
              <button type="submit" className="btn-3d btn-3d-primary w-full h-12">
                <i className="fas fa-filter mr-2"></i> Apply
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Cars Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24 text-cyan-400 text-lg">
          <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Scanning fleet inventory...
        </div>
      ) : cars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {cars.map((car) => (
            <CarCard
              key={car.car_id}
              car={car}
              searchParams={searchParams.toString()}
            />
          ))}
        </div>
      ) : (
        <div className="card-3d text-center py-20 px-6 border-red-500/20">
          <i className="fas fa-car-tunnel text-6xl text-slate-500 mb-5"></i>
          <h2 className="text-2xl font-bold text-white mb-2">No Matching Vehicles Found</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            We couldn't find vehicles matching your selected criteria. Try adjusting your dates or resetting your filters.
          </p>
          <button onClick={handleClear} className="btn-3d btn-3d-primary">
            <i className="fas fa-arrows-rotate mr-2"></i> Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
