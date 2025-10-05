// FIX: Implement the FileUpload component for handling file input.
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon, FileIcon, GenerateIcon } from './icons';
import { Difficulty } from '../types';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  onGenerate: () => void;
  isLoading: boolean;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, onGenerate, isLoading, difficulty, onDifficultyChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setFileError(null);
    if (fileRejections.length > 0) {
        setFileError("Invalid file type. Please upload a PDF, TXT, or CSV file.");
        setFile(null);
        onFileChange(null);
        return;
    }
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      onFileChange(selectedFile);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const DifficultyButton = ({ level, label }: { level: Difficulty, label: string }) => (
    <button
        onClick={() => onDifficultyChange(level)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-full
            ${difficulty === level
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
    >
        {label}
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-6">
        <div 
            {...getRootProps()} 
            className={`w-full p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50'}
            `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center text-slate-600">
                <UploadIcon className="h-10 w-10 text-slate-400" />
                {isDragActive ? (
                    <p className="mt-2 font-semibold text-indigo-700">Drop the file here ...</p>
                ) : (
                    <p className="mt-2 font-semibold">Drag & drop a file here, or click to select</p>
                )}
                <p className="text-sm text-slate-500">Supported formats: PDF, TXT, CSV</p>
            </div>
        </div>

        {fileError && (
             <p className="text-sm text-red-600">{fileError}</p>
        )}

        {file && (
            <div className="w-full max-w-md bg-slate-100 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileIcon className="h-6 w-6 text-slate-500" />
                    <span className="font-medium text-slate-700 truncate">{file.name}</span>
                </div>
                <button 
                    onClick={() => {
                        setFile(null);
                        onFileChange(null);
                    }}
                    className="text-slate-500 hover:text-red-600 font-bold text-lg"
                    aria-label="Remove file"
                >
                    &times;
                </button>
            </div>
        )}

        <div className="w-full max-w-md">
            <p className="text-sm font-medium text-slate-600 mb-2 text-center" id="difficulty-label">Select Difficulty Level</p>
            <div className="flex justify-center bg-slate-100 p-1 rounded-lg" role="group" aria-labelledby="difficulty-label">
                <DifficultyButton level="beginner" label="Beginner" />
                <DifficultyButton level="intermediate" label="Intermediate" />
                <DifficultyButton level="advanced" label="Advanced" />
            </div>
        </div>

        <button
            onClick={onGenerate}
            disabled={!file || isLoading}
            className="w-full max-w-md flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
        >
            <GenerateIcon className="h-6 w-6" />
            {isLoading ? 'Generating...' : 'Generate Study Guide'}
        </button>
    </div>
  );
};

export default FileUpload;