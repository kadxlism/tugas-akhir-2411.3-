import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:8000/api', // sesuaikan dengan Laravel kamu
  withCredentials: true,
});

export default http;
