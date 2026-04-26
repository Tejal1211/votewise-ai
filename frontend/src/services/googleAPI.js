// Google API Services
// This file provides integration with various Google APIs

// Google Civic Information API for election data
export const getElectionData = async (address) => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    const response = await fetch(
      `https://civicinfo.googleapis.com/civicinfo/v2/voterinfo?address=${encodeURIComponent(address)}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch election data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching election data:', error);
    throw error;
  }
};

// Get polling locations
export const getPollingLocations = async (address) => {
  try {
    const data = await getElectionData(address);
    return data.pollingLocations || [];
  } catch (error) {
    console.error('Error fetching polling locations:', error);
    return [];
  }
};

// Get election officials contact information
export const getElectionOfficials = async (address) => {
  try {
    const data = await getElectionData(address);
    return data.state?.[0]?.electionAdministrationBody || null;
  } catch (error) {
    console.error('Error fetching election officials:', error);
    return null;
  }
};

// Initialize Google API client (for more complex integrations)
// This would be used if you need to load the full Google API client library
export const initializeGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve(window.gapi);
      return;
    }

    // Load the Google API client library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client', () => {
        resolve(window.gapi);
      });
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Google Maps integration for location services
export const initializeGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      reject(new Error('Google API key not configured'));
      return;
    }

    // Load Google Maps JavaScript API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.onload = () => {
      resolve(window.google.maps);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};