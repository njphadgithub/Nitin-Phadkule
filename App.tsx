// FIX: Implement the main App component to structure the application.
import React, { useState } from 'react';
import { StudyGuide, Difficulty } from './types';
import FileUpload from './components/FileUpload';
import StudyGuideDisplay from './components/StudyGuideDisplay';
import Loader from './components/Loader';
import { generateStudyGuide } from './services/geminiService';
import { extractTextFromFile } from './services/fileReader';

const App: React.FC = () => {
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setStudyGuide(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setStudyGuide(null);

    try {
      const textContent = await extractTextFromFile(file);
      if (textContent.trim().length === 0) {
        throw new Error("The document appears to be empty or could not be read.");
      }
      const guide = await generateStudyGuide(textContent, difficulty);
      setStudyGuide(guide);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while generating the study guide.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-slate-800">
            AI Study Companion Created by Prof Nitin Phadkule
          </h1>
          <p className="text-slate-500 mt-1">
            Upload a document (PDF, TXT, or CSV) to automatically generate a study guide.
          </p>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200">
          <FileUpload 
            onFileChange={handleFileChange} 
            onGenerate={handleGenerate} 
            isLoading={isLoading} 
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
          />
        </div>
        
        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isLoading && <Loader />}
        
        {studyGuide && (
          <div className="mt-8">
            <StudyGuideDisplay guide={studyGuide} />
          </div>
        )}
      </main>
      <footer className="text-center py-4">
        <p className="text-slate-400 text-sm">Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;