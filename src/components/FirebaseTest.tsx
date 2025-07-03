import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';

interface FirebaseTestProps {
  db: any;
}

const FirebaseTest: React.FC<FirebaseTestProps> = ({ db }) => {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFirebase();
  }, []);

  const testFirebase = async () => {
    try {
      setStatus('Testing Firebase connection...');
      
      // Test write
      const testData = { test: true, timestamp: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'test'), testData);
      setStatus('Write test passed!');
      
      // Test read
      const snapshot = await getDocs(collection(db, 'test'));
      setStatus('Firebase is working! ✅');
      
      // Clean up test data
      // Note: In production, you'd want to delete the test document
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Firebase test failed! ❌');
    }
  };

  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4">Firebase Connection Test</h2>
      <p className="text-lg mb-4">{status}</p>
      {error && (
        <div className="bg-red-600 p-4 rounded-lg">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FirebaseTest; 