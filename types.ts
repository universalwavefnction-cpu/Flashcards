
export interface Card {
  original: string;
  translation: string;
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
