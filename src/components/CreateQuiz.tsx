import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaRocket, 
  FaArrowLeft, 
  FaCheck,
  FaCopy,
  FaTimes
} from 'react-icons/fa';
import { 
  MdQuiz, 
  MdCreate, 
  MdShare, 
  MdPlayArrow, 
  MdAssessment,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdVisibilityOff,
  MdContentCopy
} from 'react-icons/md';
import { IoSparklesOutline } from 'react-icons/io5';
import { GiBrain, GiCrown, GiOnTarget } from 'react-icons/gi';
import Loader from './Loader';
import CopyButton from './CopyButton';
import TelegramService from '../services/telegramService';
import { quizTemplates, type QuizTemplate } from '../data/quizTemplates';

interface CreateQuizProps {
  setView: (view: string) => void;
  goBack: () => void;
  db: any;
  setCreatedQuizId?: (quizId: string | null) => void;
  currentCreatedQuizId?: string | null;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

const CreateQuiz: React.FC<CreateQuizProps> = ({ setView, goBack, db, setCreatedQuizId: setAppCreatedQuizId, currentCreatedQuizId }) => {
  const [creatorName, setCreatorName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // New state for enhanced features
  const [selectedTemplate, setSelectedTemplate] = useState<QuizTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>('en');
  const [previewTemplate, setPreviewTemplate] = useState<QuizTemplate | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [bulkMode, setBulkMode] = useState(false);

  // Bulk actions functions
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedQuestions([]);
  };

  const toggleQuestionSelection = (index: number) => {
    setSelectedQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const deleteSelectedQuestions = () => {
    if (selectedQuestions.length === 0) return;
    
    const newQuestions = questions.filter((_, index) => !selectedQuestions.includes(index));
    if (newQuestions.length === 0) {
      alert('Cannot delete all questions. A quiz must have at least one question.');
      return;
    }
    
    setQuestions(newQuestions);
    setSelectedQuestions([]);
    setBulkMode(false);
  };

  const moveSelectedQuestions = (direction: 'up' | 'down') => {
    if (selectedQuestions.length === 0) return;
    
    const newQuestions = [...questions];
    const sortedIndices = [...selectedQuestions].sort((a, b) => direction === 'up' ? a - b : b - a);
    
    if (direction === 'up') {
      // Move questions up
      for (const index of sortedIndices) {
        if (index > 0) {
          [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
        }
      }
    } else {
      // Move questions down
      for (const index of sortedIndices) {
        if (index < newQuestions.length - 1) {
          [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
        }
      }
    }
    
    setQuestions(newQuestions);
  };

  // Auto-save functionality
  const saveProgress = () => {
    // Only save if we're actively creating questions and there's meaningful data
    const hasMeaningfulData = (currentStep === 2 || currentStep === 3) && (
      creatorName.trim() || 
      questions.some(q => q.question?.trim()) || 
      quizTitle.trim() || 
      selectedTemplate
    );
    
    if (!hasMeaningfulData) {
      return;
    }
    
    const progress = {
      creatorName,
      questions,
      currentStep,
      selectedTemplate,
      quizTitle,
      selectedLanguage,
      createdQuizId, // Save the created quiz ID
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem('quizCreationProgress', JSON.stringify(progress));
    setLastSaved(new Date().toLocaleTimeString());
    console.log('CreateQuiz: Progress saved to localStorage');
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('quizCreationProgress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        
        // Check if this progress is for a quiz that was already created and might have been deleted
        if (progress.createdQuizId) {
          console.log('CreateQuiz: Found progress with createdQuizId, checking if quiz still exists...');
          // If we have a created quiz ID, we should clear the progress to start fresh
          // This prevents restoring progress for deleted quizzes
          console.log('CreateQuiz: Clearing progress for previously created quiz to start fresh');
          clearProgress();
          return false;
        }
        
        // Validate the progress data before restoring
        const isValidProgress = progress && 
          (progress.creatorName || 
           (progress.questions && progress.questions.length > 0 && progress.questions.some((q: any) => q.question?.trim())) ||
           progress.quizTitle ||
           progress.selectedTemplate);
        
        if (!isValidProgress) {
          console.log('CreateQuiz: Invalid progress data detected, clearing...');
          clearProgress();
          return false;
        }
        
        // Check if the progress is too old (more than 24 hours)
        if (progress.lastSaved) {
          const lastSaved = new Date(progress.lastSaved);
          const now = new Date();
          const hoursDiff = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff > 24) {
            console.log('CreateQuiz: Progress is too old (24+ hours), clearing...');
            clearProgress();
            return false;
          }
        }
        
        setCreatorName(progress.creatorName || '');
        setQuestions(progress.questions && progress.questions.length > 0 ? progress.questions : [{ question: '', options: ['', '', '', ''], correctAnswer: '' }]);
        setCurrentStep(progress.currentStep || 1);
        setSelectedTemplate(progress.selectedTemplate || null);
        setQuizTitle(progress.quizTitle || '');
        setSelectedLanguage(progress.selectedLanguage || 'en');
        setCreatedQuizId(null); // Don't restore created quiz ID to prevent issues
        setLastSaved(progress.lastSaved ? new Date(progress.lastSaved).toLocaleTimeString() : null);
        console.log('CreateQuiz: Progress loaded from localStorage');
        return true;
      } catch (error) {
        console.error('CreateQuiz: Error loading progress:', error);
        clearProgress();
        return false;
      }
    }
    return false;
  };

  const clearProgress = () => {
    localStorage.removeItem('quizCreationProgress');
    setLastSaved(null);
    setCreatorName('');
    setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: '' }]);
    setCurrentStep(1);
    setSelectedTemplate(null);
    setQuizTitle('');
    setSelectedLanguage('en');
    setCreatedQuizId(null); // Clear created quiz ID
    // Also clear the app state
    if (setAppCreatedQuizId) {
      setAppCreatedQuizId(null);
    }
    console.log('CreateQuiz: Progress cleared from localStorage');
  };

  // Template functions
  const applyTemplate = (template: QuizTemplate) => {
    setSelectedTemplate(template);
    setQuestions(template.questions.map(q => ({
      question: selectedLanguage === 'ar' ? q.questionAr : q.question,
      options: selectedLanguage === 'ar' ? q.optionsAr : q.options,
      correctAnswer: q.options[selectedLanguage === 'ar' ? q.optionsAr.indexOf(q.optionsAr[q.correctAnswer]) : q.correctAnswer]
    })));
    setQuizTitle(selectedLanguage === 'ar' ? template.titleAr : template.title);
    setShowTemplates(false);
  };

  const clearTemplate = () => {
    setSelectedTemplate(null);
    setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: '' }]);
    setQuizTitle('');
  };

  // Load progress on component mount
  useEffect(() => {
    // Don't auto-restore success state from app state - clear it instead
    if (currentCreatedQuizId && !createdQuizId) {
      console.log('CreateQuiz: Clearing app state createdQuizId to prevent auto-restoration');
      if (setAppCreatedQuizId) {
        setAppCreatedQuizId(null);
      }
    }
  }, [currentCreatedQuizId]);

  // Auto-save when data changes - only during active question creation
  useEffect(() => {
    if ((currentStep === 2 || currentStep === 3) && 
        (creatorName.trim() || questions.some(q => q.question?.trim()) || quizTitle.trim() || selectedTemplate)) {
      saveProgress();
    }
  }, [creatorName, questions, quizTitle, selectedTemplate, selectedLanguage, currentStep]);

  // Auto-save when step changes - only during question creation
  useEffect(() => {
    if (currentStep === 2 || currentStep === 3) {
      saveProgress();
    }
  }, [currentStep]);

  // Debug state changes
  useEffect(() => {
    console.log('CreateQuiz: State changed - currentStep:', currentStep, 'createdQuizId:', createdQuizId);
  }, [currentStep, createdQuizId]);

  // Removed auto-advance useEffect to prevent automatic success state restoration

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

  const generateShortCode = async () => {
    // Generate a 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Check if this code already exists
      const quizRef = collection(db, 'quizzes');
      const q = query(quizRef, where('shortCode', '==', result));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return result; // Code is unique
      }
      
      attempts++;
    }
    
    // If we can't find a unique code after max attempts, add a random suffix
    return result + Math.floor(Math.random() * 100).toString().padStart(2, '0');
  };

  const handleSubmit = async () => {
    if (!creatorName.trim()) {
      alert('Please enter your name!');
      return;
    }

    const validQuestions = questions.filter(q => 
      q.question.trim() && 
      q.options.filter(opt => opt.trim()).length >= 2 && 
      q.correctAnswer
    );

    if (validQuestions.length === 0) {
      alert('Please add at least one valid question!');
      return;
    }

    setLoading(true);
    try {
      // Generate a short, memorable quiz code
      const shortCode = await generateShortCode();
      console.log('CreateQuiz: Generated short code:', shortCode);
      
      const creatorNameValue = (localStorage.getItem('currentCreator') || creatorName).trim();
      const creatorId = localStorage.getItem('creatorId') || '';
      const quizData = {
        creatorName: creatorNameValue,
        creatorId,
        shortCode: shortCode, // Add the short code
        questions: validQuestions,
        createdAt: new Date().toISOString(),
      };

      console.log('CreateQuiz: Quiz data to save:', quizData);
      const docRef = await addDoc(collection(db, 'quizzes'), quizData);
      console.log('CreateQuiz: Quiz saved with document ID:', docRef.id);
      
      // Send Telegram notification
      const telegramService = TelegramService.getInstance();
      await telegramService.notifyQuizCreated({
        userName: creatorName.trim(),
        quizId: shortCode, // Use short code instead of doc ID
        quizTitle: `Quiz by ${creatorName.trim()}`,
        totalQuestions: validQuestions.length,
      });
      
      // Save creator name to localStorage so Creator Space can find the quizzes
      localStorage.setItem('currentCreator', creatorNameValue);
      console.log('CreateQuiz: Saved creator name to localStorage:', creatorNameValue);
      console.log('CreateQuiz: Quiz created with short code:', shortCode);
      
      // Set the created quiz ID and show success page
      setCreatedQuizId(shortCode);
      setCurrentStep(4); // Show success step
      
      // Update app state with created quiz ID
      if (setAppCreatedQuizId) {
        setAppCreatedQuizId(shortCode);
      }
      
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepEmoji = (step: number) => {
    switch (step) {
      case 1: return <MdCreate className="text-3xl" />;
      case 2: return <GiBrain className="text-3xl" />;
      case 3: return <MdAssessment className="text-3xl" />;
      default: return <FaRocket className="text-3xl" />;
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
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden" style={{ background: 'linear-gradient(120deg, #A2D2FF 0%, #CFFFE5 100%)' }}>
      {/* Hand-drawn/doodle background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <span className="absolute left-8 top-10 text-4xl opacity-30 animate-float">⭐️</span>
        <span className="absolute right-12 top-24 text-3xl opacity-20 animate-float">✨</span>
        <span className="absolute left-1/2 top-1/3 text-5xl opacity-10 animate-float">?</span>
        <span className="absolute right-1/4 bottom-16 text-4xl opacity-20 animate-float">💧</span>
        <svg className="absolute left-1/4 bottom-8 w-32 h-8 opacity-20" viewBox="0 0 128 32" fill="none">
          <path d="M0 16 Q32 0 64 16 Q96 32 128 16" stroke="#3BB3FF" strokeWidth="3" fill="none" />
        </svg>
        <svg className="absolute right-1/4 top-8 w-32 h-8 opacity-20" viewBox="0 0 128 32" fill="none">
          <path d="M0 16 Q32 32 64 16 Q96 0 128 16" stroke="#2ED8B6" strokeWidth="3" fill="none" />
        </svg>
      </div>
      {/* Centered Logo Header with hand-drawn ring/sparkles */}
      <header className="w-full flex flex-col items-center justify-center px-6 py-8 md:px-0 md:py-10 relative z-10">
        <div className="relative flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Do You Even Know Me Logo"
            className="mx-auto shadow-xl animate-fade-in"
            style={{
              width: 120,
              height: 'auto',
              maxWidth: '60vw',
              borderRadius: '2.5rem',
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 8px 32px #b18fff33',
              padding: '1.2rem',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          {/* Hand-drawn ring */}
          <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 pointer-events-none" style={{ zIndex: -1 }} viewBox="0 0 160 160" fill="none">
            <ellipse cx="80" cy="80" rx="75" ry="60" stroke="#3BB3FF" strokeWidth="4" strokeDasharray="12 10" />
            <ellipse cx="80" cy="80" rx="60" ry="75" stroke="#2ED8B6" strokeWidth="2" strokeDasharray="8 14" />
            <text x="20" y="30" fontSize="22" fill="#FFD600" opacity="0.7">✨</text>
            <text x="110" y="130" fontSize="18" fill="#FF61A6" opacity="0.7">★</text>
          </svg>
        </div>
      </header>
      {/* Main Quiz Creation Card(s) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 w-full">
        <div className="relative rounded-3xl shadow-2xl p-6 md:p-10 max-w-4xl w-full bg-white/95 flex flex-col items-center justify-center border-4 border-[#3BB3FF] mb-8" style={{ boxShadow: '0 12px 48px #a2d2ff55' }}>
          {/* Hand-drawn border doodle */}
          <svg className="absolute -top-6 -left-6 w-16 h-16 opacity-60" viewBox="0 0 64 64" fill="none">
            <path d="M32 8 Q40 24 56 16 Q48 32 56 48 Q40 40 32 56 Q24 40 8 48 Q16 32 8 16 Q24 24 32 8Z" stroke="#A2D2FF" strokeWidth="3" strokeLinejoin="round" fill="none" />
            <text x="28" y="36" fontSize="18" fill="#3BB3FF">🔑</text>
          </svg>
          <svg className="absolute -bottom-6 -right-6 w-16 h-16 opacity-60" viewBox="0 0 64 64" fill="none">
            <path d="M8 32 Q24 24 16 8 Q32 16 48 8 Q40 24 56 32 Q40 40 48 56 Q32 48 16 56 Q24 40 8 32Z" stroke="#2ED8B6" strokeWidth="3" strokeLinejoin="round" fill="none" />
            <text x="28" y="36" fontSize="18" fill="#2ED8B6">★</text>
          </svg>
          {/* --- Main Quiz Creation Content --- */}
          <div className="w-full text-[#232946] font-quicksand">
        {/* Header */}
            <div className="mb-8">
          <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
              <button
                    onClick={goBack}
                    className="w-12 h-12 bg-[#A2D2FF]/30 hover:bg-[#A2D2FF]/60 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 border-[#3BB3FF]"
                    title="Go back to previous page"
              >
                    <FaArrowLeft className="text-2xl text-[#3BB3FF]" />
              </button>
              <div>
                    <h1 className="text-3xl font-fredoka font-extrabold text-[#232946]">Create Quiz</h1>
                    <p className="text-lg text-[#3BB3FF] font-bold">Design your personality test</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-[#A2D2FF]/40 rounded-2xl flex items-center justify-center border-2 border-[#3BB3FF]">
                    <GiCrown className="text-3xl text-[#3BB3FF]" />
                  </div>
                </div>
              </div>
            </div>
            {/* Auto-save Indicator */}
            {lastSaved && (
              <div className="bg-emerald/10 border border-emerald/20 rounded-2xl px-6 py-4 mb-6 inline-block animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald rounded-full animate-pulse"></div>
                  <FaSave className="text-emerald text-lg" />
                  <div>
                    <p className="text-emerald font-semibold text-sm">Auto-saved</p>
                    <p className="text-emerald/80 text-xs">Last saved at {lastSaved}</p>
        </div>
                </div>
              </div>
            )}
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-fredoka font-bold text-[#232946] flex items-center gap-3">
                {getStepEmoji(currentStep)}
            {getStepTitle(currentStep)}
          </h2>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${step <= currentStep ? 'bg-[#3BB3FF]' : 'bg-[#CFFFE5]'}`}
                  />
                ))}
              </div>
            </div>
            {/* Step 1: Language, Template, Title, Name */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Language Selection */}
                <div className="bg-white rounded-2xl border-2 border-[#CFFFE5] p-6 animate-fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-fredoka font-bold text-[#232946] mb-2">Choose Language</h3>
                    <p className="text-[#3BB3FF] font-bold">Select the language for your quiz</p>
                  </div>
                  <div className="max-w-md mx-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSelectedLanguage('en')}
                        className={`p-6 rounded-2xl border-2 font-bold transition-all duration-300 ${selectedLanguage === 'en' ? 'bg-[#A2D2FF]/40 border-[#3BB3FF] text-[#3BB3FF]' : 'bg-white border-[#CFFFE5] text-[#232946] hover:border-[#3BB3FF]'}`}
                      >
                        <div className="text-2xl mb-2">🇺🇸</div>
                        <div>English</div>
                      </button>
                      <button
                        onClick={() => setSelectedLanguage('ar')}
                        className={`p-6 rounded-2xl border-2 font-bold transition-all duration-300 ${selectedLanguage === 'ar' ? 'bg-[#A2D2FF]/40 border-[#3BB3FF] text-[#3BB3FF]' : 'bg-white border-[#CFFFE5] text-[#232946] hover:border-[#3BB3FF]'}`}
                      >
                        <div className="text-2xl mb-2">🇸🇦</div>
                        <div>العربية</div>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Template Selection */}
                <div className="bg-white rounded-2xl border-2 border-[#CFFFE5] p-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-fredoka font-bold text-[#232946] flex items-center gap-3">
                      <FaCopy className="text-lg" />
                      Choose a Template (Optional)
                    </h3>
                    {selectedTemplate && (
                      <button
                        onClick={clearTemplate}
                        className="text-[#FF61A6] font-bold px-3 py-1 rounded-lg hover:bg-[#FFD6E0]/60 transition-all duration-300 text-sm"
                      >
                        Clear Template
                      </button>
                    )}
                  </div>
                  {!selectedTemplate ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {quizTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="bg-white rounded-2xl p-6 border-2 border-[#CFFFE5] hover:border-[#3BB3FF] transition-all duration-300 hover:shadow-lg relative group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-bold text-[#232946] text-lg">
                              {selectedLanguage === 'ar' ? template.titleAr : template.title}
                            </h4>
                            <span className="text-sm font-bold text-[#3BB3FF]">
                              {template.difficulty}
                            </span>
                          </div>
                          <p className="text-[#232946] text-sm mb-4">
                            {selectedLanguage === 'ar' ? template.descriptionAr : template.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-[#3BB3FF] mb-4">
                            <span>{template.questions.length} questions</span>
                            <span>{template.estimatedTime} min</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPreviewTemplate(template)}
                              className="flex-1 bg-[#A2D2FF]/30 text-[#3BB3FF] px-3 py-2 rounded-lg border-2 border-[#3BB3FF] hover:bg-[#A2D2FF]/60 transition-all duration-300 text-sm font-bold"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => applyTemplate(template)}
                              className="flex-1 bg-gradient-to-r from-[#A2D2FF] to-[#CFFFE5] text-[#232946] px-3 py-2 rounded-lg font-bold border-2 border-[#3BB3FF] hover:from-[#3BB3FF]/80 hover:to-[#A2D2FF]/80 transition-all duration-300 text-sm"
                            >
                              Use Template
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#CFFFE5]/60 border-2 border-[#3BB3FF] rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-[#3BB3FF] text-lg">
                            {selectedLanguage === 'ar' ? selectedTemplate.titleAr : selectedTemplate.title}
                          </h4>
                          <p className="text-[#232946] text-sm">
                            {selectedLanguage === 'ar' ? selectedTemplate.descriptionAr : selectedTemplate.description}
                          </p>
                        </div>
                        <span className="text-lg text-[#3BB3FF] font-bold">
                          {selectedTemplate.difficulty}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Quiz Title */}
                <div className="bg-white rounded-2xl border-2 border-[#CFFFE5] p-6 animate-fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-fredoka font-bold text-[#232946] mb-2">Quiz Title</h3>
                    <p className="text-[#3BB3FF] font-bold">Give your quiz a catchy name</p>
                  </div>
                  <div className="max-w-md mx-auto">
                    <input
                      type="text"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="Enter quiz title..."
                      className="w-full px-5 py-4 rounded-xl border-2 border-[#A2D2FF] focus:border-[#3BB3FF] bg-white text-[#232946] font-bold text-lg outline-none transition-all duration-200 text-center"
                      maxLength={50}
                    />
                  </div>
                </div>
                {/* Creator Name */}
                <div className="bg-white rounded-2xl border-2 border-[#CFFFE5] p-6 animate-fade-in">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-[#A2D2FF]/30 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-[#3BB3FF]">
                      <MdCreate className="text-4xl text-[#3BB3FF]" />
                    </div>
                    <h3 className="text-xl font-fredoka font-bold text-[#232946] mb-2">What's your name?</h3>
                    <p className="text-[#3BB3FF] font-bold">This will be displayed to your friends</p>
                  </div>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Enter your name..."
                      className="w-full px-5 py-4 rounded-xl border-2 border-[#A2D2FF] focus:border-[#3BB3FF] bg-white text-[#232946] font-bold text-lg outline-none transition-all duration-200 text-center"
                maxLength={30}
              />
                  </div>
                </div>
                {/* Navigation */}
                <div className="text-center">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!creatorName.trim()}
                    className="mt-4 px-8 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-[#A2D2FF] via-[#CFFFE5] to-[#3BB3FF] text-[#232946] shadow-lg border-2 border-[#3BB3FF] animate-bounce-in hover:scale-105 hover:shadow-2xl transition-all duration-200 outline-none focus:ring-4 focus:ring-[#A2D2FF]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step →
                </button>
            </div>
          </div>
        )}
        {/* Step 2: Questions */}
        {currentStep === 2 && (
          <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-[#CFFFE5] p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-fredoka font-bold text-[#232946]">Your Questions</h3>
                    <div className="flex gap-2">
                      {questions.length > 1 && (
                        <button
                          onClick={toggleBulkMode}
                          className={`px-4 py-2 rounded-xl border-2 font-bold transition-all duration-300 ${bulkMode ? 'bg-[#A2D2FF]/40 border-[#3BB3FF] text-[#3BB3FF]' : 'bg-white border-[#CFFFE5] text-[#232946] hover:border-[#3BB3FF]'}`}
                        >
                          <MdEdit className="text-lg" />
                          {bulkMode ? 'Exit Bulk Mode' : 'Bulk Actions'}
                        </button>
                      )}
                <button
                  onClick={addQuestion}
                        className="px-4 py-2 rounded-xl border-2 border-[#3BB3FF] bg-[#A2D2FF]/40 text-[#3BB3FF] font-bold hover:bg-[#A2D2FF]/60 transition-all duration-300"
                >
                  + Add Question
                </button>
              </div>
                  </div>
                  {/* Bulk Actions Bar */}
                  {bulkMode && selectedQuestions.length > 0 && (
                    <div className="bg-[#A2D2FF]/20 border-2 border-[#3BB3FF] rounded-2xl p-4 mb-6 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="text-[#3BB3FF] font-bold">
                          {selectedQuestions.length} question{selectedQuestions.length > 1 ? 's' : ''} selected
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => moveSelectedQuestions('up')}
                            disabled={selectedQuestions.some(i => i === 0)}
                            className="bg-[#A2D2FF]/40 text-[#3BB3FF] px-3 py-2 rounded-lg border-2 border-[#3BB3FF] hover:bg-[#A2D2FF]/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move Up"
                          >↑</button>
                          <button
                            onClick={() => moveSelectedQuestions('down')}
                            disabled={selectedQuestions.some(i => i === questions.length - 1)}
                            className="bg-[#A2D2FF]/40 text-[#3BB3FF] px-3 py-2 rounded-lg border-2 border-[#3BB3FF] hover:bg-[#A2D2FF]/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move Down"
                          >↓</button>
                          <button
                            onClick={deleteSelectedQuestions}
                            className="bg-[#FFD6E0]/60 text-[#FF61A6] px-3 py-2 rounded-lg border-2 border-[#FF61A6] hover:bg-[#FFD6E0] transition-all duration-300 font-bold"
                            title="Delete Selected"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Questions List */}
              {questions.map((question, questionIndex) => (
                <div 
                  key={questionIndex} 
                      className={`bg-white rounded-2xl p-6 border-2 mb-6 animate-fade-in hover:shadow-lg transition-all duration-300 ${bulkMode && selectedQuestions.includes(questionIndex) ? 'border-[#3BB3FF] bg-[#A2D2FF]/20' : 'border-[#CFFFE5]'}`}
                  style={{ animationDelay: `${questionIndex * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          {bulkMode && (
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(questionIndex)}
                              onChange={() => toggleQuestionSelection(questionIndex)}
                              className="w-5 h-5 text-[#3BB3FF] bg-white border-2 border-[#3BB3FF] focus:ring-[#3BB3FF] rounded"
                            />
                          )}
                          <h4 className="font-bold text-[#232946] text-lg font-fredoka">
                      Question {questionIndex + 1}
                    </h4>
                        </div>
                        {!bulkMode && questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(questionIndex)}
                            className="text-[#FF61A6] hover:text-[#FF61A6]/80 p-2 rounded-xl hover:bg-[#FFD6E0]/40 transition-all duration-200 font-bold"
                      >
                            <FaTrash />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                    placeholder="Enter your question..."
                        className="w-full px-5 py-4 rounded-xl border-2 border-[#A2D2FF] focus:border-[#3BB3FF] bg-white text-[#232946] font-bold text-lg outline-none transition-all duration-200 mb-4"
                  />
                  <div className="space-y-3">
                        <h5 className="font-bold text-[#3BB3FF]">Options:</h5>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correctAnswer === option}
                          onChange={() => updateQuestion(questionIndex, 'correctAnswer', option)}
                              className="w-5 h-5 text-[#3BB3FF] bg-white border-2 border-[#3BB3FF] focus:ring-[#3BB3FF]"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                              className="w-full px-4 py-3 rounded-xl border-2 border-[#A2D2FF] focus:border-[#3BB3FF] bg-white text-[#232946] font-bold outline-none transition-all duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
                  <div className="flex justify-between mt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                      className="px-8 py-3 rounded-full font-bold text-lg bg-white text-[#3BB3FF] border-2 border-[#3BB3FF] hover:bg-[#A2D2FF]/30 transition-all duration-200"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                      className="px-8 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-[#A2D2FF] via-[#CFFFE5] to-[#3BB3FF] text-[#232946] shadow-lg border-2 border-[#3BB3FF] hover:scale-105 hover:shadow-2xl transition-all duration-200"
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
                <div className="bg-white rounded-2xl border-2 border-[#CFFFE5] p-6 animate-fade-in">
              <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-[#A2D2FF]/30 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-[#3BB3FF]">
                      <MdAssessment className="text-4xl text-[#3BB3FF]" />
                </div>
                    <h3 className="text-xl font-fredoka font-bold text-[#232946] mb-2">Review Your Quiz</h3>
                    <p className="text-[#3BB3FF] font-bold">Make sure everything looks perfect!</p>
              </div>
                  <div className="bg-[#CFFFE5]/40 rounded-2xl p-6 border-2 border-[#3BB3FF] mb-6">
                    <h4 className="font-bold text-[#232946] mb-2">Creator: {creatorName}</h4>
                    <p className="text-[#3BB3FF] font-bold">Questions: {questions.filter(q => q.question.trim()).length}</p>
              </div>
              <div className="space-y-4 mb-6">
                {questions.filter(q => q.question.trim()).map((question, index) => (
                      <div key={index} className="bg-white rounded-2xl p-4 border-2 border-[#CFFFE5]">
                        <h5 className="font-bold text-[#3BB3FF] mb-3">
                      Q{index + 1}: {question.question}
                    </h5>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex} 
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 ${option === question.correctAnswer ? 'bg-[#CFFFE5]/60 border-[#3BB3FF]' : 'bg-white border-[#CFFFE5]'}`}
                            >
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${option === question.correctAnswer ? 'bg-[#3BB3FF] text-white' : 'bg-[#A2D2FF]/40 text-[#232946]'}`}>
                            {optionIndex + 1}
                          </span>
                              <span className="text-[#232946] font-bold">{option}</span>
                          {option === question.correctAnswer && (
                                <FaCheck className="text-[#3BB3FF] font-bold" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
                  <div className="flex justify-between mt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                      className="px-8 py-3 rounded-full font-bold text-lg bg-white text-[#3BB3FF] border-2 border-[#3BB3FF] hover:bg-[#A2D2FF]/30 transition-all duration-200"
                >
                  ← Edit Questions
                </button>
                <button
                  onClick={handleSubmit}
                      className="px-8 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-[#A2D2FF] via-[#CFFFE5] to-[#3BB3FF] text-[#232946] shadow-lg border-2 border-[#3BB3FF] hover:scale-105 hover:shadow-2xl transition-all duration-200"
                >
                      <FaRocket className="mr-2" />
                  Publish Quiz
                      <IoSparklesOutline className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Step 4: Success */}
        {currentStep === 4 && createdQuizId && (
              <div className="bg-white rounded-2xl border-2 border-[#CFFFE5] p-6 animate-fade-in">
            <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-[#CFFFE5]/60 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-[#3BB3FF]">
                    <IoSparklesOutline className="text-4xl text-[#3BB3FF]" />
              </div>
                  <h3 className="text-2xl font-fredoka font-bold text-[#232946] mb-2">Quiz Published Successfully! 🎉</h3>
                  <p className="text-[#3BB3FF] font-bold">Your quiz is now live and ready to share!</p>
            </div>
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Quiz Code Section */}
                  <div className="bg-[#CFFFE5]/40 rounded-2xl p-6 border-2 border-[#3BB3FF]">
                    <h4 className="font-bold text-[#232946] mb-4 text-center">Quiz Code</h4>
                    <div className="bg-white rounded-xl p-4 border-2 border-[#3BB3FF] mb-4">
                      <code className="text-2xl font-mono font-bold text-[#3BB3FF] break-all">
                    {createdQuizId}
                  </code>
                </div>
                <div className="flex justify-center">
                  <CopyButton
                    textToCopy={createdQuizId}
                    label="Copy Quiz Code"
                    variant="primary"
                    size="lg"
                    className="text-lg"
                  />
                </div>
              </div>
                  {/* Shareable Link Section */}
                  <div className="bg-[#A2D2FF]/30 rounded-2xl p-6 border-2 border-[#3BB3FF]">
                    <h4 className="font-bold text-[#232946] mb-4 text-center">Shareable Link</h4>
                    <div className="bg-white rounded-xl p-4 border-2 border-[#3BB3FF] mb-4">
                      <code className="text-lg font-mono text-[#3BB3FF] break-all">
                        {`${window.location.origin}?join=${createdQuizId}`}
                      </code>
                    </div>
                    <div className="flex justify-center">
                      <CopyButton
                        textToCopy={`${window.location.origin}?join=${createdQuizId}`}
                        label="Copy Share Link"
                        variant="accent"
                        size="lg"
                        className="text-lg bg-[#A2D2FF] text-[#232946] hover:bg-[#3BB3FF]/80"
                      />
                    </div>
                  </div>
                  {/* Next Steps Info */}
                  <div className="bg-[#CFFFE5]/40 rounded-xl p-6 border-2 border-[#3BB3FF]">
                    <h5 className="font-bold text-[#3BB3FF] mb-3 text-center">What's next?</h5>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-[#232946]">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[#3BB3FF]">📤</span>
                          <span>Share the code or link with friends</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#2ED8B6]">🎯</span>
                          <span>They can join using the code</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[#FF61A6]">📊</span>
                          <span>View results in Creator Space</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#FFD600]">⚡</span>
                          <span>Get notified when someone takes your quiz</span>
                        </div>
                      </div>
                    </div>
              </div>
                  {/* Action Buttons */}
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                <button
                      onClick={() => {
                        setView('creator-space');
                        clearProgress();
                      }}
                      className="px-6 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-[#A2D2FF] via-[#CFFFE5] to-[#3BB3FF] text-[#232946] shadow-lg border-2 border-[#3BB3FF] hover:scale-105 hover:shadow-2xl transition-all duration-200"
                    >
                      <MdQuiz className="inline text-2xl mr-2 align-middle" />
                      Go to Creator Space
                </button>
                <button
                  onClick={() => {
                    setCreatedQuizId(null);
                    setCurrentStep(1);
                    setCreatorName('');
                    setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: '' }]);
                    setLastSaved(null);
                    clearProgress();
                  }}
                      className="px-6 py-3 rounded-full font-bold text-lg bg-white text-[#3BB3FF] border-2 border-[#3BB3FF] hover:bg-[#A2D2FF]/30 transition-all duration-200"
                >
                      <MdCreate className="inline text-2xl mr-2 align-middle" />
                  Create Another Quiz
                </button>
                    <button
                      onClick={goBack}
                      className="px-6 py-3 rounded-full font-bold text-lg bg-white text-[#3BB3FF] border-2 border-[#3BB3FF] hover:bg-[#A2D2FF]/30 transition-all duration-200"
                    >
                      <FaArrowLeft className="inline text-2xl mr-2 align-middle" />
                      Back
                    </button>
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      </main>
      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#A2D2FF]/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl border-2 border-[#3BB3FF] shadow-2xl p-8 max-w-lg w-full animate-fade-in">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-4 right-4 text-[#3BB3FF] text-2xl font-bold hover:text-[#FF61A6] transition-colors"
              aria-label="Close preview"
            >
              <FaTimes />
            </button>
            <h2 className="font-fredoka text-2xl font-extrabold text-[#232946] mb-2 text-center">
              {selectedLanguage === 'ar' ? previewTemplate.titleAr : previewTemplate.title}
            </h2>
            <p className="text-[#3BB3FF] font-bold text-center mb-4">
              {selectedLanguage === 'ar' ? previewTemplate.descriptionAr : previewTemplate.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#3BB3FF] mb-4">
              <span>📝 {previewTemplate.questions.length} questions</span>
              <span>⏱️ {previewTemplate.estimatedTime} min</span>
              <span>🎯 {previewTemplate.difficulty}</span>
            </div>
            <div className="mb-4">
              <h4 className="font-bold text-[#3BB3FF] mb-2">Sample Questions:</h4>
              {previewTemplate.questions.slice(0, 3).map((question, index) => (
                <div key={index} className="bg-[#A2D2FF]/20 rounded-xl p-4 border-2 border-[#3BB3FF] mb-2">
                  <p className="font-bold text-[#232946] mb-2">
                    Q{index + 1}: {selectedLanguage === 'ar' ? question.questionAr : question.question}
                  </p>
                  <ul className="list-disc pl-5 text-[#232946]">
                    {question.options.slice(0, 2).map((option, optIndex) => (
                      <li key={optIndex}>{selectedLanguage === 'ar' ? question.optionsAr?.[optIndex] || option : option}</li>
                    ))}
                    {question.options.length > 2 && (
                      <li className="text-[#3BB3FF]">+{question.options.length - 2} more options...</li>
                    )}
                  </ul>
                </div>
              ))}
              {previewTemplate.questions.length > 3 && (
                <div className="text-center text-[#3BB3FF] text-sm mt-2">
                  +{previewTemplate.questions.length - 3} more questions...
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2 border-t border-[#CFFFE5] mt-4">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="flex-1 bg-white text-[#3BB3FF] border-2 border-[#3BB3FF] px-4 py-3 rounded-xl font-bold hover:bg-[#A2D2FF]/30 transition-all duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (previewTemplate) {
                    applyTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-[#A2D2FF] to-[#CFFFE5] text-[#232946] border-2 border-[#3BB3FF] px-4 py-3 rounded-xl font-bold hover:from-[#3BB3FF]/80 hover:to-[#A2D2FF]/80 transition-all duration-200"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="footer-minimal mt-auto mb-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <svg width="220" height="18" viewBox="0 0 220 18" fill="none">
            <path d="M10 10 Q60 18 110 10 Q160 2 210 10" stroke="#3BB3FF" strokeWidth="4" fill="none" />
          </svg>
          <span>MADE BY v3lix.io</span>
        </div>
      </footer>
      {/* Custom Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700;900&family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet" />
      {/* Animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(24px);} to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 1.1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes bounce-in { 0% { opacity: 0; transform: scale(0.8) translateY(40px); } 60% { opacity: 1; transform: scale(1.05) translateY(-8px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-bounce-in { animation: bounce-in 0.9s cubic-bezier(.4,0,.2,1) both; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        .animate-float { animation: float 5s ease-in-out infinite; }
      `}</style>
      {/* Custom Font Classes */}
      <style>{`
        .font-fredoka { font-family: 'Fredoka', 'Poppins', 'Arial Rounded MT Bold', Arial, sans-serif; }
        .font-quicksand { font-family: 'Quicksand', 'Inter', Arial, sans-serif; }
      `}</style>
    </div>
  );
};

export default CreateQuiz; 