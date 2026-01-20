import { useState, useEffect } from 'react';

export default function Bootstrapper({ children }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This is where you run all your "Startup" logic
    async function startSystem() {
      try {
        console.log("ERP Bootstrapper: Checking System Integrity...");
        
        // 1. Simulating an API call to check if the server is up
        // You could use your Postman URL here later!
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        
        console.log("ERP Bootstrapper: All systems green.");
        setIsInitializing(false);
      } catch (err) {
        setError("System failed to initialize. Please contact IT.");
        setIsInitializing(false);
      }
    }

    startSystem();
  }, []);

  // 1. SHOW LOADING SPLASH
  if (isInitializing) {
    return (
      <div style={splashStyle}>
        <div className="spinner"></div>
        <h1 style={{ marginTop: '20px' }}>MINI-ERP v1.0</h1>
        <p>Loading Modules & Security Context...</p>
      </div>
    );
  }

  // 2. SHOW ERROR SCREEN (If something breaks)
  if (error) {
    return <div style={errorStyle}>⚠️ {error}</div>;
  }

  // 3. SHOW THE ACTUAL APP
  return children;
}

// Simple styles for the splash screen
const splashStyle = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#1e293b',
  color: 'white',
  fontFamily: 'sans-serif'
};

const errorStyle = { ...splashStyle, backgroundColor: '#991b1b' };