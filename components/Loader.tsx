
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center my-10">
        <div className="w-12 h-12 border-4 border-t-indigo-600 border-r-indigo-600 border-b-indigo-300 border-l-indigo-300 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-semibold text-slate-700">Analyzing your document...</p>
        <p className="text-slate-500">This may take a moment.</p>
    </div>
  );
};

export default Loader;
