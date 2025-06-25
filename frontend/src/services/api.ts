import axios from 'axios';

export const api = axios.create({
  // A URL base da nossa API no backend
  baseURL: 'http://localhost:3001/api/v1', 
});
