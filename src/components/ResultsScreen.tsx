import React, { useMemo, useState, useEffect } from 'react';
import { addDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

interface FeedbackItem {
  feedback: string;
  rating: number;
  createdAt: string;
}

interface ResultsScreenProps {
  setView: (view: string) => void;
  score: number;
  quizData: { questions: { questionText: string }[] };
  quizId: string;
  db: any;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ setView, score, quizData, quizId, db }) => {
  const totalQuestions = quizData.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  const { title, message, emoji } = useMemo(() => {
    if (percentage === 100) {
      return { title: "Are You a Stalker?", message: "Okay, this is scary. You're either my soulmate or you've been reading my diary. I'm both flattered and terrified.", emoji: '😱' };
    }
    if (percentage >= 75) {
      return { title: "Impressive!", message: "You actually listen to me ramble. You're a keeper. Or maybe you just have a freakishly good memory for useless trivia.", emoji: '😎' };
    }
    if (percentage >= 50) {
      return { title: "Not Bad...", message: "You know enough to be dangerous. You're officially a 'good friend,' which is code for 'I tolerate your presence.'", emoji: '😏' };
    }
    if (percentage >= 25) {
      return { title: "Well, This is Awkward.", message: "Do we even know each other? I've had deeper conversations with my houseplants. Seriously.", emoji: '😬' };
    }
    if (percentage > 0) {
      return { title: "A Stranger in My Life", message: "Are you sure you have the right person? I think my barista knows more about me. This is just sad.", emoji: '🤦' };
    }
    return { title: "A Perfect Failure", message: "Wow. A perfect score... in failure. It's almost impressive how little you know. Are we living in the same reality? I'm genuinely concerned.", emoji: '😂' };
  }, [percentage]);

  // Feedback state
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // All feedback for this quiz
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const fetchAllFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const feedbackRef = collection(db, `quizzes/${quizId}/feedback`);
      const q = query(feedbackRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const feedbackList: FeedbackItem[] = snapshot.docs.map(doc => doc.data() as FeedbackItem);
      setAllFeedback(feedbackList);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (submitted) {
      fetchAllFeedback();
    }
  }, [submitted]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const feedbackData = {
        feedback,
        rating,
        createdAt: new Date().toISOString(),
        score,
        percentage,
      };
      await addDoc(collection(db, `quizzes/${quizId}/feedback`), feedbackData);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="text-center max-w-xl mx-auto">
      <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-xl">
        <div className="text-8xl mb-6 animate-bounce" aria-label="Result emoji">{emoji}</div>
        <h2 className="text-4xl font-extrabold text-white mb-4">{title}</h2>
        <p className="text-2xl text-indigo-300 font-bold mb-6">You scored {score} out of {totalQuestions} ({percentage}%)</p>
        <p className="text-slate-300 text-lg mb-8">{message}</p>
        <button 
          onClick={() => setView('welcome')}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-all duration-200 mb-8"
          aria-label="Try another quiz"
        >
          Try Another Quiz
        </button>
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-white mb-2">Feedback</h3>
          {submitted ? (
            <>
              <div className="text-green-400 font-bold mb-6">Thank you for your feedback! 🎉</div>
              <div className="bg-slate-900/70 rounded-xl p-4 max-h-64 overflow-y-auto border border-slate-700">
                <h4 className="text-lg font-bold text-indigo-300 mb-2">See what others thought!</h4>
                {loadingFeedback ? (
                  <div className="text-slate-400">Loading feedback...</div>
                ) : allFeedback.length === 0 ? (
                  <div className="text-slate-400">No feedback yet.</div>
                ) : (
                  <ul className="space-y-4 text-left">
                    {allFeedback.map((fb, idx) => (
                      <li key={idx} className="border-b border-slate-700 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-yellow-400">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                          <span className="text-xs text-slate-400 ml-2">{new Date(fb.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-slate-200">{fb.feedback}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="What did you think of the game and the questions?"
                className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                required
                aria-label="Feedback"
              />
              <div className="flex items-center gap-4">
                <label htmlFor="rating" className="text-slate-300">Your Rating:</label>
                <select
                  id="rating"
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                  className="bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Rating"
                >
                  {[5,4,3,2,1].map(val => (
                    <option key={val} value={val}>{val} {val === 1 ? 'star' : 'stars'}</option>
                  ))}
                </select>
              </div>
              {error && <div className="text-red-400">{error}</div>}
              <button
                type="submit"
                className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-all"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen; 