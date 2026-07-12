import { useEffect } from 'react';
import { useGameStore } from '@/hooks/useGameStore';
import { GameCreation } from '@/components/GameCreation';
import { GameBoard } from '@/components/GameBoard';
import { QuestionView } from '@/components/QuestionView';
import { AnswerView } from '@/components/AnswerView';
import { GamesList } from '@/components/GamesList';
const Index = () => {
  const {
    game,
    clearGame
  } = useGameStore();

  // Ensure the home page always shows the landing content
  // If a game was previously loaded, clear it when visiting '/'
  useEffect(() => {
    clearGame();
  }, [clearGame]);

  // Only show game components if we have a game loaded (for backward compatibility)
  // New games should use the /game/:urlId route
  if (game) {
    // Show answer view if we're viewing an answer
    if (game?.showAnswer && game?.currentQuestion) {
      return <AnswerView />;
    }

    // Show question view if we have a current question
    if (game?.currentQuestion) {
      return <QuestionView />;
    }

    // Show game board
    return <GameBoard />;
  }

  // Show game creation and games list by default
  return <div className="min-h-screen bg-board-background">
      {/* Header */}
      <div className="bg-board-background py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-jeopardy-gold mb-4">Host Jeopardy</h1>
          <p className="text-lg md:text-xl text-primary-foreground max-w-2xl mx-auto">Fun trivia for you and your friends.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Game Creation (2/3 width) */}
          <div className="lg:col-span-2">
            <GameCreation showHeader={false} />
          </div>
          
          {/* Right Column - Recent Games (1/3 width) */}
          <div className="lg:col-span-1">
            <GamesList compact={true} />
          </div>
        </div>
      </div>
    </div>;
};
export default Index;