import React, { useState, useCallback } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { TrashIcon } from './icons';
import Loader from './Loader';
import CustomModal from './CustomModal';

interface CreateQuizProps {
  setView: (view: string) => void;
  setQuizId: (id: string) => void;
  appId: string;
  db: any;
}

const CreateQuiz: React.FC<CreateQuizProps> = ({ setView, setQuizId, appId, db }) => {
  const [creatorName, setCreatorName] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);

  const handleQuestionChange = useCallback((index: number, event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = event.target.value;
    setQuestions(newQuestions);
  }, [questions]);

  const handleOptionChange = useCallback((qIndex: number, oIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = event.target.value;
    setQuestions(newQuestions);
  }, [questions]);

  const handleCorrectAnswerChange = useCallback((qIndex: number, event: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = event.target.value;
    setQuestions(newQuestions);
  }, [questions]);

  const addQuestion = useCallback(() => {
    if (questions.length < 20) {
      setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
    } else {
      setError({ title: "Question Limit", message: "You can add a maximum of 20 questions." });
    }
  }, [questions]);

  const confirmRemoveQuestion = (index: number) => {
    setConfirmDeleteIdx(index);
  };

  const removeQuestion = useCallback((index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      setConfirmDeleteIdx(null);
    } else {
      setError({ title: "Hold On!", message: "A quiz needs at least one question." });
      setConfirmDeleteIdx(null);
    }
  }, [questions]);

  const validateQuiz = () => {
    if (!creatorName.trim()) {
      return "Please enter your name.";
    }
    for (const q of questions) {
      if (!q.questionText.trim()) {
        return "All question fields must be filled out.";
      }
      if (q.options.some(opt => !opt.trim())) {
        return "All four options must be filled out for each question.";
      }
      if (!q.correctAnswer.trim()) {
        return "Please select a correct answer for each question.";
      }
      if (!q.options.includes(q.correctAnswer)) {
        return "The correct answer must be one of the four options.";
      }
    }
    return null;
  };

  const submitQuiz = async () => {
    const validationError = validateQuiz();
    if (validationError) {
      setError({ title: "Incomplete Quiz", message: validationError });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const quizData = { 
        creatorName, 
        questions,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'quizzes'), quizData);
      setQuizId(docRef.id);
      setView('share');
    } catch (err) {
      console.error("Error creating quiz:", err);
      setError({ 
        title: "Creation Failed", 
        message: `Could not save your quiz. Please check your connection and try again. Error: ${err instanceof Error ? err.message : 'Unknown error'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader text="Saving your masterpiece..." />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {error && <CustomModal title={error.title} message={error.message} onClose={() => setError(null)} />}
      {confirmDeleteIdx !== null && (
        <CustomModal
          title="Delete Question?"
          message="Are you sure you want to delete this question? This action cannot be undone."
          onClose={() => setConfirmDeleteIdx(null)}
        >
          <button onClick={() => removeQuestion(confirmDeleteIdx)} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 mt-4">Delete</button>
        </CustomModal>
      )}
      <button onClick={() => setView('welcome')} className="text-indigo-400 hover:text-indigo-300 mb-6" aria-label="Back to Home">&larr; Back to Home</button>
      <h2 className="text-4xl font-bold text-white mb-2">Create Your Quiz</h2>
      <p className="text-slate-400 mb-8">Fill in the details below. Be creative, be weird, be you.</p>

      <div className="bg-slate-800/50 p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-xl">
        <div className="mb-8">
          <label htmlFor="creatorName" className="block text-lg font-bold text-slate-200 mb-2">Your Name</label>
          <input
            type="text"
            id="creatorName"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            placeholder="e.g., The Mysterious One"
            className="w-full bg-slate-700 text-white p-4 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Creator name"
          />
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-slate-900/70 p-6 rounded-xl mb-6 border border-slate-700 relative">
            {questions.length > 1 && (
              <button onClick={() => confirmRemoveQuestion(qIndex)} className="absolute -top-3 -right-3 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all" aria-label="Delete question">
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
            <h3 className="text-xl font-bold text-indigo-300 mb-4">Question {qIndex + 1}</h3>
            <textarea
              value={q.questionText}
              onChange={(e) => handleQuestionChange(qIndex, e)}
              placeholder="What's my most toxic trait?"
              className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 mb-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={`Question ${qIndex + 1}`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((opt, oIndex) => (
                <input
                  key={oIndex}
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                  placeholder={`Option ${oIndex + 1}`}
                  className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  aria-label={`Option ${oIndex + 1} for question ${qIndex + 1}`}
                />
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-bold text-slate-300 mb-2">Which one is the correct answer?</label>
              <select
                value={q.correctAnswer}
                onChange={(e) => handleCorrectAnswerChange(qIndex, e)}
                className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={`Correct answer for question ${qIndex + 1}`}
              >
                <option value="" disabled>Select the correct answer</option>
                {q.options.filter(opt => opt.trim() !== '').map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center mt-8">
          <button onClick={addQuestion} className="bg-slate-700 text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-600 transition-all" aria-label="Add question">
            + Add Question
          </button>
          <button onClick={submitQuiz} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-all text-lg transform hover:scale-105" aria-label="Save and get code">
            Save & Get Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz; 