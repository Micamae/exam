
export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  image?: string;
}

export type Answers = Record<number, string>;

export type Language = 'english' | 'tagalog';

export type Screen = 'login' | 'language' | 'exam' | 'results';