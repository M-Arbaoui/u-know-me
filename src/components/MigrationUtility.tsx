import React, { useState } from 'react';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

interface MigrationUtilityProps {
  db: any;
  onComplete: () => void;
}

const MigrationUtility: React.FC<MigrationUtilityProps> = ({ db, onComplete }) => {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const migrateQuizzes = async () => {
    setMigrating(true);
    setProgress(0);

    try {
      // Get all quizzes that don't have a shortCode
      const quizzesRef = collection(db, 'quizzes');
      const q = query(quizzesRef, where('shortCode', '==', null));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Also check for quizzes without shortCode field
        const allQuizzes = await getDocs(quizzesRef);
        const quizzesToMigrate = allQuizzes.docs.filter(doc => {
          const data = doc.data();
          return !data.shortCode;
        });
        
        setTotal(quizzesToMigrate.length);
        
        for (let i = 0; i < quizzesToMigrate.length; i++) {
          const quizDoc = quizzesToMigrate[i];
          const shortCode = generateShortCode();
          
          await updateDoc(doc(db, 'quizzes', quizDoc.id), {
            shortCode: shortCode
          });
          
          setProgress(i + 1);
        }
      } else {
        setTotal(snapshot.size);
        
        for (let i = 0; i < snapshot.docs.length; i++) {
          const quizDoc = snapshot.docs[i];
          const shortCode = generateShortCode();
          
          await updateDoc(doc(db, 'quizzes', quizDoc.id), {
            shortCode: shortCode
          });
          
          setProgress(i + 1);
        }
      }
      
      alert(`Migration completed! ${total} quizzes updated with short codes.`);
      onComplete();
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed. Please try again.');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-dreamy animate-fade-in">
      <div className="container mx-auto px-4 py-6">
        <div className="card">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-charcoal-800 mb-4">Database Migration</h1>
            <p className="text-charcoal-600 mb-6">
              This will add short codes to existing quizzes to make them easier to share.
            </p>
            
            {migrating ? (
              <div>
                <div className="mb-4">
                  <div className="w-full bg-lavender-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-teal-400 to-coral-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(progress / total) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-charcoal-600 mt-2">
                    Progress: {progress} / {total}
                  </p>
                </div>
                <p className="text-charcoal-600">Please wait while we update your quizzes...</p>
              </div>
            ) : (
              <button
                onClick={migrateQuizzes}
                className="btn-primary"
              >
                🚀 Start Migration
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationUtility; 