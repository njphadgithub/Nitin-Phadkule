import React, { useState } from 'react';
import { FlashcardStatus } from '../types';
import { CheckCircleIcon, ExclamationIcon } from './icons';

interface FlashcardProps {
  front: string;
  back: string;
  status: FlashcardStatus;
  onStatusChange: (status: FlashcardStatus) => void;
}

const FlashcardComponent: React.FC<FlashcardProps> = ({ front, back, status, onStatusChange }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleStatusClick = (e: React.MouseEvent, newStatus: FlashcardStatus) => {
    e.stopPropagation(); // Prevents the card from flipping back when a button is clicked
    onStatusChange(newStatus);
  };

  const backFontSize = back.length > 200 ? 'text-sm' : 'text-base';
  const frontFontSize = front.length > 50 ? 'text-lg' : 'text-xl';

  const StatusIndicator = () => {
    switch (status) {
      case 'learned':
        return <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-green-500 shadow-sm" title="Learned"></div>;
      case 'needs_review':
        return <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-yellow-400 shadow-sm" title="Needs Review"></div>;
      default:
        return null;
    }
  };

  return (
    <div
      className="group h-56 w-full [perspective:1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative h-full w-full rounded-xl shadow-lg transition-all duration-500 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-xl bg-slate-100 p-6 text-center [backface-visibility:hidden]">
            <StatusIndicator />
            <h3 className={`font-bold text-indigo-700 ${frontFontSize}`}>{front}</h3>
        </div>
        {/* Back */}
        <div className="absolute inset-0 h-full w-full rounded-xl bg-indigo-600 p-4 text-white [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="flex h-full flex-col items-center justify-between text-center">
            <p className={`${backFontSize} overflow-y-auto`}>{back}</p>
            <div className="flex justify-center gap-3 mt-3 w-full">
                <button 
                    onClick={(e) => handleStatusClick(e, 'needs_review')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-semibold bg-yellow-400 text-yellow-900 rounded-md hover:bg-yellow-500 transition-colors"
                >
                    <ExclamationIcon className="h-4 w-4" />
                    Needs Review
                </button>
                <button 
                    onClick={(e) => handleStatusClick(e, 'learned')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-semibold bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                    <CheckCircleIcon className="h-4 w-4" />
                    Learned It!
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardComponent;
