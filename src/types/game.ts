export interface Question {
  id: string;
  text: string;
  answer: string;
  value: number;
  answered: boolean;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface Game {
  id: string;
  title: string;
  categories: Category[];
  currentQuestion?: Question;
  showAnswer: boolean;
  urlId?: string;
}

export interface DatabaseGame {
  id: string;
  name: string;
  slug: string;
  categories: { name: string; order: number }[];
  created_at: string;
  updated_at: string;
}