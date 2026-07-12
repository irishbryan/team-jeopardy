import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/hooks/useGameStore';
import { Question } from '@/types/game';
import { GameShare } from '@/components/GameShare';
import { Home } from 'lucide-react';

export const GameBoard = () => {
  const navigate = useNavigate();
  const { game, selectQuestion, clearGame } = useGameStore();

  if (!game) return null;

  const handleQuestionClick = (question: Question) => {
    if (!question.answered) {
      selectQuestion(question.id);
    }
  };

  return (
    <div className="min-h-screen bg-board-background p-2 md:p-4">
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-4 md:mb-8">
          <div className="relative mb-4">
            <div>
              <h1 className="text-2xl md:text-5xl font-bold text-primary-foreground mb-2">
                {game.title}
              </h1>
              <div className="w-16 md:w-32 h-1 bg-gradient-gold mx-auto rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Mobile: Horizontal scrolling container */}
        <div className="block md:hidden overflow-x-auto pb-4">
          <div className="inline-flex flex-col gap-2 min-w-max">
            {/* Category Headers */}
            <div className="flex gap-2">
              {game.categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-board-category text-jeopardy-gold p-2 rounded-lg shadow-category border border-jeopardy-gold/30 w-[120px] flex items-center justify-center"
                >
                  <h2 className="text-sm font-bold text-center uppercase tracking-wider leading-tight px-1" lang="en" style={{ hyphens: 'auto' }}>
                    {category.name}
                  </h2>
                </div>
              ))}
            </div>

            {/* Question Cards - Mobile horizontal layout */}
            {[0, 1, 2, 3, 4].map((questionIndex) => (
              <div key={questionIndex} className="flex gap-2">
                {game.categories.map((category) => {
                  const question = category.questions[questionIndex];
                  return (
                    <Button
                      key={`${category.id}-${questionIndex}`}
                      variant={question.answered ? "answered" : "question-card"}
                      className="h-16 text-lg font-black tracking-wide min-w-[120px]"
                      onClick={() => handleQuestionClick(question)}
                      disabled={question.answered}
                    >
                      {question.answered ? "---" : `$${question.value}`}
                    </Button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Regular grid layout */}
        <div className="hidden md:grid grid-cols-6 gap-4 max-w-6xl mx-auto">
          {/* Category Headers */}
          {game.categories.map((category) => (
            <div
              key={category.id}
              className="bg-board-category text-jeopardy-gold p-4 rounded-lg shadow-category border border-jeopardy-gold/30 flex items-center justify-center"
            >
              <h2 className="text-lg font-bold text-center uppercase tracking-wider leading-tight px-2" lang="en" style={{ hyphens: 'auto' }}>
                {category.name}
              </h2>
            </div>
          ))}

          {/* Question Cards */}
          {[0, 1, 2, 3, 4].map((questionIndex) => (
            game.categories.map((category) => {
              const question = category.questions[questionIndex];
              return (
                <Button
                  key={`${category.id}-${questionIndex}`}
                  variant={question.answered ? "answered" : "question-card"}
                  className="h-28 text-3xl font-black tracking-wide"
                  onClick={() => handleQuestionClick(question)}
                  disabled={question.answered}
                >
                  {question.answered ? "---" : `$${question.value}`}
                </Button>
              );
            })
          ))}
        </div>
        
        {/* Game Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-board-background/95 backdrop-blur-sm border-t border-jeopardy-gold/20 p-4 flex flex-col gap-2 sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:bg-transparent sm:backdrop-blur-none sm:border-t-0 sm:flex-row sm:justify-center sm:gap-4 sm:mt-4 md:mt-8 sm:px-4">
          {game.urlId && (
            <GameShare urlId={game.urlId} gameTitle={game.title} />
          )}
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              clearGame();
              navigate('/');
            }}
          >
            <Home className="h-4 w-4" />
            Back Home
          </Button>
        </div>
      </div>
    </div>
  );
};