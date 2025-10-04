// FIX: Define the data structures used throughout the application.
export type FlashcardStatus = 'unseen' | 'learned' | 'needs_review';

export interface Flashcard {
  front: string;
  back: string;
}

export interface QAPair {
  question: string;
  answer: string;
}

export interface StudyGuide {
  summary: string;
  qaPairs: QAPair[];
  flashcards: Flashcard[];
}
