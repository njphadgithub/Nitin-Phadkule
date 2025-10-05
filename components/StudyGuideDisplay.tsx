import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { StudyGuide, Flashcard, FlashcardStatus } from '../types';
import FlashcardComponent from './Flashcard';
import { SummaryIcon, QAIcon, FlashcardIcon, DownloadIcon, ArrowLeftIcon, ArrowRightIcon } from './icons';

declare const jspdf: any;
declare const html2canvas: any;

interface StudyGuideDisplayProps {
  guide: StudyGuide;
}

// A local type to manage flashcards with a stable ID and status
interface FlashcardWithState extends Flashcard {
    id: number;
    status: FlashcardStatus;
}

type Tab = 'summary' | 'qa' | 'flashcards';

const StudyGuideDisplay: React.FC<StudyGuideDisplayProps> = ({ guide }) => {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [isExporting, setIsExporting] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardWithState[]>([]);
  const [flashcardFilter, setFlashcardFilter] = useState<'all' | 'needs_review'>('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const pdfExportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialFlashcards = guide.flashcards.map((card, index) => ({
        ...card,
        id: index,
        status: 'unseen' as FlashcardStatus,
    }));
    setFlashcards(initialFlashcards);
  }, [guide]);
  
  // Reset index when guide or filter changes
  useEffect(() => {
    setCurrentCardIndex(0);
  }, [guide, flashcardFilter]);

  const handleUpdateFlashcardStatus = (id: number, status: FlashcardStatus) => {
    setFlashcards(prev => 
        prev.map(card => card.id === id ? { ...card, status } : card)
    );
  };
  
  const filteredFlashcards = useMemo(() => {
    if (flashcardFilter === 'all') {
        return flashcards;
    }
    // "Needs Review" includes unseen cards and those explicitly marked
    return flashcards.filter(card => card.status === 'needs_review' || card.status === 'unseen');
  }, [flashcards, flashcardFilter]);

  const handlePrevCard = () => {
    setCurrentCardIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextCard = () => {
    setCurrentCardIndex(prev => Math.min(filteredFlashcards.length - 1, prev + 1));
  };

  const handleExport = useCallback(async () => {
    if (!pdfExportRef.current || typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        console.error("Export dependencies are not loaded.");
        return;
    }
    
    setIsExporting(true);

    try {
        const { jsPDF } = jspdf;
        const canvas = await html2canvas(pdfExportRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;

        let imgWidth = pdfWidth;
        let imgHeight = imgWidth / ratio;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save('study-guide.pdf');
    } catch (error) {
        console.error("Failed to export PDF:", error);
    } finally {
        setIsExporting(false);
    }
  }, []);

  const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
        activeTab === tab
          ? 'bg-indigo-600 text-white'
          : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
  
  const FilterButton = ({ filter, label }: { filter: 'all' | 'needs_review', label: string }) => (
    <button
        onClick={() => setFlashcardFilter(filter)}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
            flashcardFilter === filter
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-200'
        }`}
    >
        {label}
    </button>
  );

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
          <TabButton tab="summary" label="Summary" icon={<SummaryIcon className="h-5 w-5" />} />
          <TabButton tab="qa" label="Q & A" icon={<QAIcon className="h-5 w-5" />} />
          <TabButton tab="flashcards" label="Flashcards" icon={<FlashcardIcon className="h-5 w-5" />} />
        </div>
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-slate-700 disabled:bg-slate-400 transition-colors"
        >
            <DownloadIcon className="h-5 w-5" />
            {isExporting ? 'Exporting...' : 'Export as PDF'}
        </button>
      </div>

      <div className="mt-4 min-h-[400px]">
        {activeTab === 'summary' && (
          <div className="prose prose-slate max-w-none prose-h2:text-indigo-700 prose-p:text-slate-700 prose-ul:text-slate-700">
            <h2>Key Topic Summary</h2>
            <p>{guide.summary}</p>
          </div>
        )}
        {activeTab === 'qa' && (
          <div>
             <h2 className="text-2xl font-bold text-indigo-700 mb-4">Question & Answer</h2>
             <div className="space-y-4">
                {guide.qaPairs.map((pair, index) => (
                    <details key={index} className="bg-slate-50 p-4 rounded-lg group">
                        <summary className="font-semibold text-slate-800 cursor-pointer list-none flex justify-between items-center">
                            {pair.question}
                            <span className="text-indigo-600 transform transition-transform duration-200 group-open:rotate-180">&#9660;</span>
                        </summary>
                        <p className="mt-3 text-slate-700">{pair.answer}</p>
                    </details>
                ))}
             </div>
          </div>
        )}
        {activeTab === 'flashcards' && (
          <div>
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">Flashcards</h2>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                 <p className="text-slate-600">Click a card to flip it. Use arrows to navigate.</p>
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                    <FilterButton filter="all" label="All" />
                    <FilterButton filter="needs_review" label="Needs Review" />
                </div>
            </div>
            
            {filteredFlashcards.length > 0 ? (
              <div className="w-full max-w-lg mx-auto">
                <div className="relative overflow-hidden h-56">
                  <div
                    className="flex h-full transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
                    aria-live="polite"
                  >
                    {filteredFlashcards.map((card, index) => (
                      <div 
                        key={card.id} 
                        className="w-full flex-shrink-0 px-2"
                        aria-hidden={index !== currentCardIndex}
                      >
                        <FlashcardComponent 
                            front={card.front} 
                            back={card.back}
                            status={card.status}
                            onStatusChange={(newStatus) => handleUpdateFlashcardStatus(card.id, newStatus)} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-8 mt-6">
                  <button
                    onClick={handlePrevCard}
                    disabled={currentCardIndex === 0}
                    className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous card"
                  >
                    <ArrowLeftIcon className="h-6 w-6 text-slate-700" />
                  </button>
                  <p className="text-slate-600 font-medium tabular-nums text-lg" aria-label={`Card ${currentCardIndex + 1} of ${filteredFlashcards.length}`}>
                    {currentCardIndex + 1} / {filteredFlashcards.length}
                  </p>
                  <button
                    onClick={handleNextCard}
                    disabled={currentCardIndex >= filteredFlashcards.length - 1}
                    className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next card"
                  >
                    <ArrowRightIcon className="h-6 w-6 text-slate-700" />
                  </button>
                </div>
              </div>
            ) : (
                <p className="text-slate-500 col-span-full text-center py-8">No flashcards to display in this category.</p>
            )}
          </div>
        )}
      </div>

      {/* Hidden element for PDF export */}
      <div className="absolute -z-10 -left-[9999px] top-auto w-[800px] bg-white p-8" ref={pdfExportRef}>
        <h1 className="text-3xl font-bold mb-6 text-slate-900">Study Guide</h1>
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-2 border-b-2 border-indigo-200 pb-2">Key Topic Summary</h2>
            <p className="text-slate-700 text-base">{guide.summary}</p>
        </div>
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 border-b-2 border-indigo-200 pb-2">Question & Answer</h2>
            {guide.qaPairs.map((pair, index) => (
                <div key={`pdf-qa-${index}`} className="mb-3 break-inside-avoid">
                    <p className="font-bold text-slate-800 text-base">{index + 1}. {pair.question}</p>
                    <p className="text-slate-700 text-base pl-4">- {pair.answer}</p>
                </div>
            ))}
        </div>
        <div>
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 border-b-2 border-indigo-200 pb-2">Flashcards</h2>
            <div className="grid grid-cols-2 gap-4">
            {guide.flashcards.map((card, index) => (
                <div key={`pdf-fc-${index}`} className="border-2 border-slate-300 rounded-lg p-3 break-inside-avoid">
                     <p className="font-bold text-indigo-600 text-base pb-1 border-b border-slate-200">{card.front}</p>
                     <p className="mt-1 text-slate-700 text-sm">{card.back}</p>
                </div>
            ))}
            </div>
        </div>
      </div>

    </div>
  );
};

export default StudyGuideDisplay;