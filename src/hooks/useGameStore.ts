import { create } from 'zustand';
import { Game, Category, Question, DatabaseGame } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';

interface GameStore {
  game: Game | null;
  createGame: (title: string, categories: string[]) => Promise<string>;
  loadGame: (urlId: string) => Promise<void>;
  clearGame: () => void;
  selectQuestion: (questionId: string) => void;
  markAnswered: (questionId: string) => void;
  showAnswer: () => void;
  hideAnswer: () => void;
  backToBoard: () => void;
  getLocalGameState: (urlId: string) => Game | null;
  saveLocalGameState: (urlId: string, game: Game) => void;
}

const generateQuestions = (categoryName: string): Question[] => {
  const questionTemplates = {
    'HISTORY': [
      { text: 'This ancient wonder of the world was located in Alexandria', answer: 'What is the Lighthouse of Alexandria?' },
      { text: 'This emperor built a wall across northern Britain', answer: 'Who is Hadrian?' },
      { text: 'This war ended in 1945', answer: 'What is World War II?' },
      { text: 'This document was signed in 1776', answer: 'What is the Declaration of Independence?' },
      { text: 'This empire was ruled by Caesar', answer: 'What is the Roman Empire?' }
    ],
    'SCIENCE': [
      { text: 'This is the chemical symbol for gold', answer: 'What is Au?' },
      { text: 'This planet is closest to the Sun', answer: 'What is Mercury?' },
      { text: 'This scientist developed the theory of relativity', answer: 'Who is Einstein?' },
      { text: 'This is the powerhouse of the cell', answer: 'What is the mitochondria?' },
      { text: 'This gas makes up about 78% of Earth\'s atmosphere', answer: 'What is nitrogen?' }
    ],
    'SPORTS': [
      { text: 'This sport is played at Wimbledon', answer: 'What is tennis?' },
      { text: 'This team sport uses a puck', answer: 'What is hockey?' },
      { text: 'This event happens every four years', answer: 'What are the Olympics?' },
      { text: 'This position in football throws the ball', answer: 'What is quarterback?' },
      { text: 'This is the maximum score in bowling', answer: 'What is 300?' }
    ],
    'MOVIES': [
      { text: 'This 1994 film featured Tom Hanks on a park bench', answer: 'What is Forrest Gump?' },
      { text: 'This director made Jaws and E.T.', answer: 'Who is Steven Spielberg?' },
      { text: 'This animated movie features the song "Let It Go"', answer: 'What is Frozen?' },
      { text: 'This film series features a young wizard', answer: 'What is Harry Potter?' },
      { text: 'This movie won Best Picture in 2020', answer: 'What is Parasite?' }
    ],
    'GEOGRAPHY': [
      { text: 'This is the largest continent', answer: 'What is Asia?' },
      { text: 'This river is the longest in the world', answer: 'What is the Nile?' },
      { text: 'This country has the most time zones', answer: 'What is Russia?' },
      { text: 'This mountain range contains Mt. Everest', answer: 'What are the Himalayas?' },
      { text: 'This is the smallest country in the world', answer: 'What is Vatican City?' }
    ],
    'MUSIC': [
      { text: 'This instrument has 88 keys', answer: 'What is a piano?' },
      { text: 'This composer wrote "The Four Seasons"', answer: 'Who is Vivaldi?' },
      { text: 'This genre originated in New Orleans', answer: 'What is jazz?' },
      { text: 'This band released "Bohemian Rhapsody"', answer: 'Who is Queen?' },
      { text: 'This note comes after G in the musical alphabet', answer: 'What is A?' }
    ],
    'FOOD': [
      { text: 'This spice is known as "red gold"', answer: 'What is saffron?' },
      { text: 'This fruit is used to make guacamole', answer: 'What is avocado?' },
      { text: 'This cooking method uses dry heat in an oven', answer: 'What is baking?' },
      { text: 'This Italian dish means "little strings" in English', answer: 'What is spaghetti?' },
      { text: 'This fermented milk product originated in Bulgaria', answer: 'What is yogurt?' }
    ],
    'LITERATURE': [
      { text: 'This author wrote "Pride and Prejudice"', answer: 'Who is Jane Austen?' },
      { text: 'This Shakespeare play features a Danish prince', answer: 'What is Hamlet?' },
      { text: 'This epic poem tells of Odysseus\'s journey home', answer: 'What is The Odyssey?' },
      { text: 'This novel begins "Call me Ishmael"', answer: 'What is Moby Dick?' },
      { text: 'This dystopian novel features Big Brother', answer: 'What is 1984?' }
    ],
    'TECHNOLOGY': [
      { text: 'This company created the iPhone', answer: 'What is Apple?' },
      { text: 'This programming language is named after a snake', answer: 'What is Python?' },
      { text: 'This social media platform uses a blue bird logo', answer: 'What is Twitter?' },
      { text: 'This stands for Hypertext Markup Language', answer: 'What is HTML?' },
      { text: 'This virtual reality company was bought by Meta', answer: 'What is Oculus?' }
    ]
  };

  // Try to find exact match first
  let templates = questionTemplates[categoryName.toUpperCase() as keyof typeof questionTemplates];
  
  // If no exact match, create generic questions for the category
  if (!templates) {
    templates = [
      { text: `This is commonly associated with ${categoryName}`, answer: `What is [${categoryName} item 1]?` },
      { text: `This term is frequently used in ${categoryName}`, answer: `What is [${categoryName} term 1]?` },
      { text: `This person is well-known in ${categoryName}`, answer: `Who is [${categoryName} person 1]?` },
      { text: `This concept is fundamental to ${categoryName}`, answer: `What is [${categoryName} concept 1]?` },
      { text: `This is considered important in ${categoryName}`, answer: `What is [${categoryName} item 2]?` }
    ];
  }

  return templates.map((template, index) => ({
    id: `${categoryName}-${index}`,
    text: template.text,
    answer: template.answer,
    value: (index + 1) * 200,
    answered: false
  }));
};

const defaultCategories = ['HISTORY', 'SCIENCE', 'SPORTS', 'MOVIES', 'GEOGRAPHY'];

const generateUrlId = () => {
  return Math.random().toString(36).substring(2, 8).toLowerCase();
};

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,

  createGame: async (title: string, categories: string[]): Promise<string> => {
    try {
      const categoryNames = categories.length > 0 ? categories : defaultCategories;
      const categoriesForGeneration = categoryNames.map((name, index) => ({ name, order: index }));
      
      // Generate questions using OpenAI
      const { data: questionsData, error: questionsError } = await supabase.functions.invoke('generate-questions', {
        body: { name: title, categories: categoriesForGeneration }
      });

      if (questionsError) {
        // Try to extract HTTP status, headers, and JSON error from Supabase Functions error
        const errAny: any = questionsError as any;
        const res: Response | undefined = errAny?.context;

        let serverMsg: string | undefined;
        try {
          if (res && typeof (res as any).json === 'function') {
            const body = await (res as any).json();
            serverMsg = body?.message || body?.error;
          }
        } catch {}

        throw new Error(serverMsg || 'Failed to generate questions. Please try again.');
      }

      if (!questionsData?.categories || !questionsData?.urlId) {
        throw new Error('Failed to create game - invalid response from server');
      }

      // Convert database format to game format
      const newGame: Game = {
        id: questionsData.gameId,
        title: title,
        urlId: questionsData.urlId,
        categories: questionsData.categories,
        showAnswer: false
      };

      set({ game: newGame });
      
      // Return the URL ID for navigation (the component will handle navigation)
      return questionsData.urlId;
    } catch (error) {
      console.error('Failed to create game:', error);
      throw error;
    }
  },

  loadGame: async (urlId: string): Promise<void> => {
    // Find game by slug
    const { data: dbGame, error } = await supabase
      .from('games')
      .select('*')
      .eq('slug', urlId)
      .single();

    if (error || !dbGame) {
      throw new Error('Game not found');
    }

    // Check if we have local state for this game
    const localGame = get().getLocalGameState(urlId);
    
    let game: Game;
    
    if (localGame) {
      // Use local state if available, but ensure we have the latest data
      game = {
        ...localGame,
        urlId: dbGame.slug,
        categories: dbGame.categories as unknown as Category[]
      };
    } else {
      // Use data from database - categories now contain full question data
      game = {
        id: dbGame.id,
        title: dbGame.name,
        categories: dbGame.categories as unknown as Category[],
        showAnswer: false,
        urlId: dbGame.slug
      };
    }

    set({ game });
  },

  selectQuestion: (questionId: string) => {
    const { game } = get();
    if (!game) return;

    const question = game.categories
      .flatMap(cat => cat.questions)
      .find(q => q.id === questionId);

    if (question && !question.answered) {
      set({
        game: {
          ...game,
          currentQuestion: question,
          showAnswer: false
        }
      });
    }
  },

  markAnswered: (questionId: string) => {
    const { game } = get();
    if (!game) return;

    const updatedGame = {
      ...game,
      categories: game.categories.map(category => ({
        ...category,
        questions: category.questions.map(question =>
          question.id === questionId ? { ...question, answered: true } : question
        )
      })),
      currentQuestion: undefined,
      showAnswer: false
    };

    set({ game: updatedGame });
    
    // Save to local storage
    if (game.urlId) {
      get().saveLocalGameState(game.urlId, updatedGame);
    }
  },

  showAnswer: () => {
    const { game } = get();
    if (!game) return;

    set({
      game: {
        ...game,
        showAnswer: true
      }
    });
  },

  hideAnswer: () => {
    const { game } = get();
    if (!game) return;

    set({
      game: {
        ...game,
        showAnswer: false
      }
    });
  },

  backToBoard: () => {
    const { game } = get();
    if (!game) return;

    set({
      game: {
        ...game,
        currentQuestion: undefined,
        showAnswer: false
      }
    });
  },

  clearGame: () => {
    set({ game: null });
  },

  getLocalGameState: (urlId: string): Game | null => {
    const saved = localStorage.getItem(`jeopardy-game-${urlId}`);
    if (!saved) return null;
    
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  saveLocalGameState: (urlId: string, game: Game) => {
    localStorage.setItem(`jeopardy-game-${urlId}`, JSON.stringify(game));
  },
}));