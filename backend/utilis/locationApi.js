import axios from 'axios';

const API_KEY = atob('VWpZdHdmbUUxN3lhU2lzZWJ6QzBDZ3BjZ2hKZ0h2a0xWRWxNR084Zw==');
const BASE_URL = 'https://api.countrystatecity.in/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-CSCAPI-KEY': API_KEY
  }
});

export const getCountries = async () => {
  try {
    const response = await api.get('/countries');
    return response.data.map(country => ({
      value: country.iso2,
      label: country.name
    }));
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

export const getStates = async (countryCode) => {
  if (!countryCode) return [];
  try {
    const response = await api.get(`/countries/${countryCode}/states`);
    return response.data.map(state => ({
      value: state.iso2,
      label: state.name,
      countryCode
    }));
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

export const getCities = async (countryCode, stateCode) => {
  if (!countryCode || !stateCode) return [];
  try {
    const response = await api.get(`/countries/${countryCode}/states/${stateCode}/cities`);
    return response.data.map(city => ({
      value: city.name,
      label: city.name,
      countryCode,
      stateCode
    }));
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};