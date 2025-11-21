
export interface Card {
  original: string;
  translation: string;
  progress?: number; // 0 = learning, 1-2 = partially correct, 3 = mastered
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
}

export type LanguageDirection = 'de-en' | 'en-de';

export interface AIContext {
  sampleSentence: string;
  sentenceTranslation: string;
  explanation: string;
}
