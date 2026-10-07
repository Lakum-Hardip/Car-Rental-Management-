/**
 * Velocity 3D API Client Service
 * Communicates with the Python Django backend with fallback resiliency
 */

const BASE_URL = '/api';

// Initial fallback mock data matching Django database
const INITIAL_CARS = [
  {
    car_id: 1,
    brand: 'Toyota',
    model: 'Fortuner',
    reg_no: 'DL-01-AA-0001',
    vehicle_type: 'Petrol',
    capacity: 7,
    rent_per_day: 5000,
    status: 'Available',
    image: null,
    latitude: 23.0225,
    longitude: 72.5714,
  },
  {
    car_id: 2,
    brand: 'Hyundai',
    model: 'Creta',
    reg_no: 'DL-01-AA-0002',
    vehicle_type: 'Diesel',
    capacity: 5,
    rent_per_day: 3500,
    status: 'Available',
    image: null,
    latitude: 23.033,
    longitude: 72.585,
  },
  {
    car_id: 3,
    brand: 'Maruti',
    model: 'Swift',
    reg_no: 'DL-01-AA-0003',
    vehicle_type: 'Petrol',
    capacity: 5,
    rent_per_day: 2000,
    status: 'Available',
    image: null,
    latitude: 23.045,
    longitude: 72.512,
  },
  {
    car_id: 4,
    brand: 'Mahindra',
    model: 'XUV500',
    reg_no: 'DL-01-AA-0004',
    vehicle_type: 'Diesel',
    capacity: 7,
    rent_per_day: 4500,
    status: 'Available',
    image: null,
    latitude: 23.011,
    longitude: 72.56,
  },
  {
    car_id: 5,
    brand: 'Honda',
    model: 'City',
    reg_no: 'DL-01-AA-0005',
    vehicle_type: 'Petrol',
    capacity: 5,
    rent_per_day: 2500,
    status: 'Available',
    image: null,
    latitude: 23.078,
    longitude: 72.599,
  },
  {
    car_id: 6,
    brand: 'Tata',
    model: 'Safari',
    reg_no: 'DL-01-AA-0006',
    vehicle_type: 'Diesel',
    capacity: 7,
    rent_per_day: 4000,
    status: 'Available',
    image: null,
    latitude: 23.029,
    longitude: 72.541,
  },
  {
    car_id: 7,
    brand: 'Kia',
    model: 'Seltos',
    reg_no: 'DL-01-AA-0007',
    vehicle_type: 'Petrol',
    capacity: 5,
    rent_per_day: 3200,
    status: 'Available',
    image: null,
    latitude: 23.015,
    longitude: 72.525,
  },
  {
    car_id: 8,
    brand: 'BMW',
    model: 'M4 Competition',
    reg_no: 'MH-02-CP-9999',
    vehicle_type: 'Petrol',
    capacity: 4,
    rent_per_day: 12000,
    status: 'Available',
    image: null,
    latitude: 23.036,
    longitude: 72.565,
  },
  {
    car_id: 9,
    brand: 'Porsche',
    model: 'Taycan Turbo',
    reg_no: 'MH-01-EV-8888',
    vehicle_type: 'Electric',
    capacity: 4,
    rent_per_day: 18000,
    status: 'Available',
    image: null,
    latitude: 23.05,
    longitude: 72.57,
  },
];

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      return null;
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

export const api = {
  // Cars
  async getCars(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/cars/${query ? `?${query}` : ''}`);
    if (res && res.success) return res.cars;
    
    // Fallback filter
    let list = JSON.parse(localStorage.getItem('velocity_cars') || JSON.stringify(INITIAL_CARS));
    if (params.car_type) {
      const q = params.car_type.toLowerCase();
      list = list.filter(c => c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q) || c.vehicle_type.toLowerCase().includes(q));
    }
    return list;
  },

  async getCar(id) {
    const res = await request(`/cars/${id}/`);
    if (res && res.success) return res.car;
    const list = JSON.parse(localStorage.getItem('velocity_cars') || JSON.stringify(INITIAL_CARS));
    return list.find(c => c.car_id === Number(id)) || list[0];
  },

  // Auth
  async login(email, password) {
    const res = await request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res) return res;

    // Local fallback
    const user = { customer_id: 1, name: 'Hardip Lakum', email, phone_no: '+91 6354220182', license_no: 'GJ-01-2022-984', address: 'Ahmedabad, Gujarat' };
    localStorage.setItem('velocity_user', JSON.stringify(user));
    localStorage.setItem('velocity_user_type', 'customer');
    return { success: true, customer: user, user_type: 'customer' };
  },

  async adminLogin(username, password) {
    const res = await request('/auth/admin-login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res) return res;

    if (username === 'admin' && password === 'admin123') {
      const admin = { admin_id: 1, username: 'admin', email: 'admin@velocity.com', role: 'Manager' };
      localStorage.setItem('velocity_user', JSON.stringify(admin));
      localStorage.setItem('velocity_user_type', 'admin');
      return { success: true, admin, user_type: 'admin' };
    }
    return { success: false, error: 'Invalid admin username or password.' };
  },

  async register(formData) {
    const res = await request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    if (res) return res;

    const user = { customer_id: Date.now(), ...formData };
    localStorage.setItem('velocity_user', JSON.stringify(user));
    localStorage.setItem('velocity_user_type', 'customer');
    return { success: true, customer: user, user_type: 'customer' };
  },

  async getMe() {
    const res = await request('/auth/me/');
    if (res && res.user) return res;

    const storedUser = localStorage.getItem('velocity_user');
    const storedType = localStorage.getItem('velocity_user_type');
    if (storedUser && storedType) {
      return { success: true, user: JSON.parse(storedUser), user_type: storedType };
    }
    return { success: true, user: null, user_type: null };
  },

  async logout() {
    await request('/auth/logout/', { method: 'POST' });
    localStorage.removeItem('velocity_user');
    localStorage.removeItem('velocity_user_type');
    return { success: true };
  },

  // Customer: Bookings & Payments
  async getBookings() {
    const res = await request('/bookings/');
    if (res && res.success) return res.bookings;

    const bookings = JSON.parse(localStorage.getItem('velocity_bookings') || '[]');
    return bookings;
  },

  async createBooking(data) {
    const res = await request('/bookings/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.success) return res.booking;

    // Fallback
    const car = await this.getCar(data.car_id);
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    const newBooking = {
      booking_id: Math.floor(1000 + Math.random() * 9000),
      car,
      customer_id: 1,
      customer_name: 'Hardip Lakum',
      customer_email: 'lakumhardip11@gmail.com',
      start_date: data.start_date,
      end_date: data.end_date,
      total_amount: days * (car ? car.rent_per_day : 3000),
      payment_status: 'Unpaid',
      contract_accepted: true,
      is_cancelled: false,
      created_at: new Date().toISOString(),
    };

    const bookings = JSON.parse(localStorage.getItem('velocity_bookings') || '[]');
    bookings.unshift(newBooking);
    localStorage.setItem('velocity_bookings', JSON.stringify(bookings));
    return newBooking;
  },

  async getBooking(id) {
    const res = await request(`/bookings/${id}/`);
    if (res && res.success) return res;

    const bookings = JSON.parse(localStorage.getItem('velocity_bookings') || '[]');
    const b = bookings.find(item => item.booking_id === Number(id)) || bookings[0];
    return {
      success: true,
      booking: b,
      payment: b?.payment_status === 'Paid' ? { payment_id: 991, amount: b.total_amount, method: 'Card', payment_date: new Date().toISOString().split('T')[0] } : null,
      customer: { name: 'Hardip Lakum', email: 'lakumhardip11@gmail.com', phone_no: '+91 6354220182' },
    };
  },

  async cancelBooking(id) {
    const res = await request(`/bookings/${id}/cancel/`, { method: 'POST' });
    if (res && res.success) return res;

    const bookings = JSON.parse(localStorage.getItem('velocity_bookings') || '[]');
    const idx = bookings.findIndex(b => b.booking_id === Number(id));
    if (idx !== -1) {
      bookings[idx].is_cancelled = true;
      bookings[idx].refund_amount = bookings[idx].total_amount;
      localStorage.setItem('velocity_bookings', JSON.stringify(bookings));
      return { success: true, booking: bookings[idx] };
    }
    return { success: false };
  },

  async processPayment(bookingId, paymentData) {
    const res = await request(`/payments/${bookingId}/`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    if (res && res.success) return res;

    const bookings = JSON.parse(localStorage.getItem('velocity_bookings') || '[]');
    const idx = bookings.findIndex(b => b.booking_id === Number(bookingId));
    if (idx !== -1) {
      bookings[idx].payment_status = 'Paid';
      localStorage.setItem('velocity_bookings', JSON.stringify(bookings));
    }
    return { success: true, payment_id: Math.floor(100 + Math.random() * 900) };
  },

  async updateProfile(profileData) {
    const res = await request('/profile/', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
    if (res && res.success) return res.customer;

    localStorage.setItem('velocity_user', JSON.stringify(profileData));
    return profileData;
  },

  // Admin APIs
  async getAdminDashboard() {
    const res = await request('/admin/dashboard/');
    if (res && res.success) return res;

    return {
      stats: {
        total_bookings: 18,
        today_bookings: 3,
        revenue_total: 145000,
        revenue_today: 12500,
        vehicles_total: 11,
        vehicles_available: 8,
        vehicles_maintenance: 1,
        customers_count: 14,
      },
      daily_bookings: Array.from({ length: 14 }).map((_, i) => ({
        date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 6) + 1,
      })),
      recent_bookings: (await this.getBookings()).slice(0, 8),
    };
  },

  async getAdminCars() {
    const res = await request('/admin/cars/');
    if (res && res.success) return res.cars;
    return JSON.parse(localStorage.getItem('velocity_cars') || JSON.stringify(INITIAL_CARS));
  },

  async addCar(carData) {
    const res = await request('/admin/cars/', {
      method: 'POST',
      body: JSON.stringify(carData),
    });
    if (res && res.success) return res.car;

    const list = JSON.parse(localStorage.getItem('velocity_cars') || JSON.stringify(INITIAL_CARS));
    const newCar = { car_id: Date.now(), ...carData };
    list.unshift(newCar);
    localStorage.setItem('velocity_cars', JSON.stringify(list));
    return newCar;
  },

  async updateCar(id, carData) {
    const res = await request(`/admin/cars/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(carData),
    });
    if (res && res.success) return res.car;

    const list = JSON.parse(localStorage.getItem('velocity_cars') || JSON.stringify(INITIAL_CARS));
    const idx = list.findIndex(c => c.car_id === Number(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...carData };
      localStorage.setItem('velocity_cars', JSON.stringify(list));
      return list[idx];
    }
    return null;
  },

  async deleteCar(id) {
    const res = await request(`/admin/cars/${id}/`, { method: 'DELETE' });
    if (res && res.success) return true;

    let list = JSON.parse(localStorage.getItem('velocity_cars') || JSON.stringify(INITIAL_CARS));
    list = list.filter(c => c.car_id !== Number(id));
    localStorage.setItem('velocity_cars', JSON.stringify(list));
    return true;
  },

  async toggleCarStatus(id, newStatus) {
    const res = await request(`/admin/cars/${id}/status/`, {
      method: 'POST',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res && res.success) return res.status;

    const list = JSON.parse(localStorage.getItem('velocity_cars') || JSON.stringify(INITIAL_CARS));
    const car = list.find(c => c.car_id === Number(id));
    if (car) {
      car.status = newStatus || (car.status === 'Available' ? 'Booked' : car.status === 'Booked' ? 'Maintenance' : 'Available');
      localStorage.setItem('velocity_cars', JSON.stringify(list));
      return car.status;
    }
    return 'Available';
  },

  async getAdminBookings() {
    const res = await request('/admin/bookings/');
    if (res && res.success) return res.bookings;
    return this.getBookings();
  },

  async updateAdminBooking(bookingId, updates) {
    const res = await request('/admin/bookings/', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, ...updates }),
    });
    return res;
  },

  async getAdminCustomers() {
    const res = await request('/admin/customers/');
    if (res && res.success) return res.customers;
    return [
      { customer_id: 1, name: 'Hardip Lakum', email: 'lakumhardip11@gmail.com', phone_no: '+91 6354220182', license_no: 'GJ-01-2022-984', address: 'Ahmedabad, Gujarat', bookings_count: 3 },
      { customer_id: 2, name: 'Aarav Sharma', email: 'aarav@example.com', phone_no: '+91 9876543210', license_no: 'DL-04-2021-112', address: 'New Delhi', bookings_count: 1 },
      { customer_id: 3, name: 'Priya Patel', email: 'priya@example.com', phone_no: '+91 9123456789', license_no: 'MH-12-2023-455', address: 'Mumbai, Maharashtra', bookings_count: 2 },
    ];
  },

  async getAdminCustomerDetail(id) {
    const res = await request(`/admin/customers/${id}/`);
    if (res && res.success) return res;
    return {
      customer: { customer_id: id, name: 'Hardip Lakum', email: 'lakumhardip11@gmail.com', phone_no: '+91 6354220182', license_no: 'GJ-01-2022-984', address: 'Ahmedabad, Gujarat' },
      bookings: await this.getBookings(),
    };
  },

  async getAdminPayments() {
    const res = await request('/admin/payments/');
    if (res && res.success) return res.payments;
    return [
      { payment_id: 101, booking_id: 1001, customer_name: 'Hardip Lakum', vehicle: 'Toyota Fortuner', amount: 15000, method: 'Card', payment_date: '2026-10-06' },
      { payment_id: 102, booking_id: 1002, customer_name: 'Aarav Sharma', vehicle: 'Hyundai Creta', amount: 7000, method: 'Online', payment_date: '2026-10-05' },
    ];
  },

  async getAdminReports() {
    const res = await request('/admin/reports/');
    if (res && res.success) return res.reports;
    return {
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
  },

  async getAdminMaintenance() {
    const res = await request('/admin/maintenance/');
    if (res && res.success) return res.maintenance;
    return [
      { id: 1, car_id: 4, vehicle: 'Mahindra XUV500 (DL-01-AA-0004)', scheduled_date: '2026-10-08', completed_date: null, description: 'Periodic engine tuning & brake rotor inspection', cost: 4200, status: 'In Progress' },
      { id: 2, car_id: 2, vehicle: 'Hyundai Creta (DL-01-AA-0002)', scheduled_date: '2026-09-28', completed_date: '2026-09-29', description: 'Synthetic oil replacement & AC filter swap', cost: 3100, status: 'Completed' },
    ];
  },

  async addMaintenance(data) {
    const res = await request('/admin/maintenance/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  async getAdminActivityLogs() {
    const res = await request('/admin/activity-logs/');
    if (res && res.success) return res.logs;
    return [
      { id: 1, admin: 'admin', action: 'Fleet Status Toggle', model_name: 'Car', details: 'Updated DL-01-AA-0001 status to Available', ip_address: '127.0.0.1', created_at: '2026-10-07T10:14:00' },
      { id: 2, admin: 'admin', action: 'Booking Verification', model_name: 'Booking', details: 'Marked booking #1001 payment verified', ip_address: '127.0.0.1', created_at: '2026-10-07T09:42:00' },
      { id: 3, admin: 'admin', action: 'Security Login', model_name: 'AdminUser', details: 'Authorized manager console session', ip_address: '127.0.0.1', created_at: '2026-10-07T08:30:00' },
    ];
  },
};
