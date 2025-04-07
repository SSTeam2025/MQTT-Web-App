import axios from 'axios';

const API_URL = 'http://localhost:6080/api'; // Update this with your backend URL

const authService = {
  login: async (email, password) => {
    if (email === 'test@test.com' && password === 'Test1234!!!') {
      const userData = {
        token: '1234567890',
        user: {
          id: 1,
          email: 'test@test.com',
          role: 'admin',
          name: 'Test User',
        },
      };
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      return userData;
    } else {
      throw new Error('Invalid email or password');
    }
    // try {
    //   const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    //   if (response.data.token) {
    //     localStorage.setItem('user', JSON.stringify(response.data));
    //     axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    //   }
    //   return response.data;
    // } catch (error) {
    //   const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
    //   throw new Error(errorMessage);
    // }
  },

  register: async (userData) => {
    if (userData.email === 'test@test.com' && userData.password === 'Test1234!!!') {
      return {
        token: '1234567890',
        user: {
          id: 1,
          email: 'test@test.com',
          role: 'admin',
          name: 'Test User',
        },
      };
    } else {
      throw new Error('Invalid email or password');
    }
    
    // try {
    //   const response = await axios.post(`${API_URL}/auth/register`, userData);
    //   return response.data;
    // } catch (error) {
    //   const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
    //   throw new Error(errorMessage);
    // }
  },

  logout: () => {
    localStorage.removeItem('user');
    axios.defaults.headers.common['Authorization'] = null;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    const user = authService.getCurrentUser();
    return user?.token;
  },

  isAuthenticated: () => {
    return !!authService.getToken();
  },

  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role;
  }
};

export default authService; 