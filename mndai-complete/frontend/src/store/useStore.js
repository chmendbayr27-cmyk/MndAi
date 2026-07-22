import create from 'zustand';

const useStore = create((set) => ({
  // Auth
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user')) || null,
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
  loadToken: () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token) set({ token, user });
  },

  // Chat
  messages: [],
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, timestamp: new Date() }]
  })),
  clearMessages: () => set({ messages: [] }),

  // Bookings
  bookings: [],
  setBookings: (bookings) => set({ bookings }),

  // Customers
  customers: [],
  setCustomers: (customers) => set({ customers }),

  // UI State
  loading: false,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),
  success: null,
  setSuccess: (success) => set({ success })
}));

export { useStore };
