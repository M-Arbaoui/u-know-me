import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import Loader from './Loader';

interface CreateQuizProps {
  setView: (view: string) => void;
  db: any;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

const CreateQuiz: React.FC<CreateQuizProps> = ({ setView, db }) => {
  const [creatorName, setCreatorName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    if (field === 'options') {
      newQuestions[index].options = value;
    } else {
      (newQuestions[index] as any)[field] = value;
    }
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!creatorName.trim()) {
      alert('Please enter your name!');
      return;
    }

    const validQuestions = questions.filter(q => 
      q.question.trim() && 
      q.options.every(opt => opt.trim()) && 
      q.correctAnswer.trim()
    );

    if (validQuestions.length === 0) {
      alert('Please add at least one complete question!');
      return;
    }

    setLoading(true);
    try {
      const quizData = {
        creatorName: creatorName.trim(),
        questions: validQuestions,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'quizzes'), quizData);
      alert(`Quiz created successfully! Your quiz code is: ${docRef.id}`);
      setView('creator-space');
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepEmoji = (step: number) => {
    switch (step) {
      case 1: return '👤';
      case 2: return '❓';
      case 3: return '✨';
      default: return '🎯';
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Who are you?';
      case 2: return 'Create your questions';
      case 3: return 'Review & publish';
      default: return 'Quiz creation';
    }
  };

  if (loading) {
    return <Loader text="Creating your masterpiece..." />;
  }

  return (
    <div className="min-h-screen bg-dreamy animate-fade-in">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('creator-space')}
                className="w-10 h-10 bg-lavender-100 hover:bg-lavender-200 rounded-xl flex items-center justify-center transition-all duration-200"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-charcoal-800">Create Your Quiz</h1>
                <p className="text-charcoal-600">Design the ultimate personality test</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-coral-400 rounded-2xl flex items-center justify-center shadow-neon-teal">
              <span className="text-2xl">✨</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                  step <= currentStep 
                    ? 'bg-gradient-to-br from-teal-400 to-coral-400 text-white shadow-neon-teal' 
                    : 'bg-lavender-100 text-charcoal-400'
                }`}>
                  {getStepEmoji(step)}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                    step < currentStep ? 'bg-gradient-to-r from-teal-400 to-coral-400' : 'bg-lavender-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <h2 className="text-xl font-bold text-charcoal-800 text-center">
            {getStepTitle(currentStep)}
          </h2>
        </div>

        {/* Step 1: Creator Name */}
        {currentStep === 1 && (
          <div className="card animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-lavender-200 to-powder-200 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                <span className="text-4xl">👤</span>
              </div>
              <h3 className="text-xl font-bold text-charcoal-800 mb-2">What's your name?</h3>
              <p className="text-charcoal-600">This will be displayed to your friends</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Enter your name..."
                className="input-field w-full text-center text-lg font-semibold"
                maxLength={30}
              />
              <div className="text-center mt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!creatorName.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-charcoal-800">Your Questions</h3>
                <button
                  onClick={addQuestion}
                  className="btn-secondary text-sm"
                >
                  + Add Question
                </button>
              </div>

              {questions.map((question, questionIndex) => (
                <div 
                  key={questionIndex} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-lavender-200 mb-6 animate-slide-up"
                  style={{ animationDelay: `${questionIndex * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-charcoal-800 text-lg">
                      Question {questionIndex + 1}
                    </h4>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-coral-500 hover:text-coral-600 p-2 rounded-xl hover:bg-coral-50 transition-all duration-200"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                    placeholder="Enter your question..."
                    className="input-field w-full mb-4"
                  />

                  <div className="space-y-3">
                    <h5 className="font-semibold text-charcoal-700">Options:</h5>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correctAnswer === option}
                          onChange={() => updateQuestion(questionIndex, 'correctAnswer', option)}
                          className="w-5 h-5 text-teal-600 bg-lavender-100 border-lavender-300 focus:ring-teal-500"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="input-field flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-primary"
                >
                  Review Quiz →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="card">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-powder-200 to-teal-200 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                  <span className="text-4xl">✨</span>
                </div>
                <h3 className="text-xl font-bold text-charcoal-800 mb-2">Review Your Quiz</h3>
                <p className="text-charcoal-600">Make sure everything looks perfect!</p>
              </div>

              <div className="bg-gradient-to-br from-lavender-50 to-powder-50 rounded-2xl p-6 border border-lavender-200 mb-6">
                <h4 className="font-bold text-charcoal-800 mb-2">Creator: {creatorName}</h4>
                <p className="text-charcoal-600">Questions: {questions.filter(q => q.question.trim()).length}</p>
              </div>

              <div className="space-y-4 mb-6">
                {questions.filter(q => q.question.trim()).map((question, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-lavender-200">
                    <h5 className="font-semibold text-charcoal-800 mb-3">
                      Q{index + 1}: {question.question}
                    </h5>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex} 
                          className={`flex items-center gap-3 p-3 rounded-xl ${
                            option === question.correctAnswer 
                              ? 'bg-teal-50 border border-teal-200' 
                              : 'bg-lavender-50 border border-lavender-200'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                            option === question.correctAnswer 
                              ? 'bg-teal-500 text-white' 
                              : 'bg-lavender-300 text-charcoal-600'
                          }`}>
                            {optionIndex + 1}
                          </span>
                          <span className="text-charcoal-700">{option}</span>
                          {option === question.correctAnswer && (
                            <span className="text-teal-600 font-bold">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary"
                >
                  ← Edit Questions
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn-primary group"
                >
                  <span className="mr-2">🚀</span>
                  Publish Quiz
                  <span className="ml-2 group-hover:scale-110 transition-transform">✨</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateQuiz; 