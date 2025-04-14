import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8081/api/auth'; // Update this with your backend URL

const authService = {
  login: async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      const userData = { username: email, password: password };
      const response = await axios.post(`${API_URL}/login`, userData);
      console.log('Login response:', response);
      
      if (response.data === 'User logged in') {
        const token = response.headers['authorization']?.split(' ')[1];
        console.log('Received token:', token);
        
        if (!token) {
          throw new Error('No token received from server');
        }

        const decodedToken = jwtDecode(token);
        console.log('Decoded token:', decodedToken);
        
        const user = {
          token,
          user: {
            email: decodedToken.sub,
            username: decodedToken.sub,
            role: decodedToken.role,
            name: decodedToken.sub.split('@')[0]
          }
        };
        
        console.log('Storing user data:', user);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return user;
      }
      
      throw new Error('Login failed - Invalid response');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  },

  register: async (userData) => {
    // if (userData.email === 'test@test.com' && userData.password === 'Test1234!!!') {
    //   return {
    //     token: '1234567890',
    //     user: {
    //       id: 1,
    //       email: 'test@test.com',
    //       role: 'admin',
    //       name: 'Test User',
    //     },
    //   };
    // } else {
    //   throw new Error('Invalid email or password');
    // }
    
    try {
      console.log('Registering user:', userData);
      const requestUserData = {
        username: userData.email,
        password: userData.password,
        role: userData.role
      };
      console.log('Sending registration request:', requestUserData);

      const response = await axios.post(`${API_URL}/register`, requestUserData);
      console.log('Registration response:', response);

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      const responseMessage = error.response?.data === "Username already exists" 
        ? "Email already used" 
        : error.response?.data || 'Registration failed. Please try again.';
      throw new Error(responseMessage);
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    axios.defaults.headers.common['Authorization'] = null;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    console.log('###User###\n' + user)
    console.log('###User###\n', JSON.parse(user)?.user)
    console.log("CECECECE")
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
    console.log("ASD")
    console.log(user?.user?.role)
    console.log("DSA")
    return user?.user?.role;
  }
};

export default authService; 