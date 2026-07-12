import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useGameStore } from '@/hooks/useGameStore';
import { useMetaTags } from '@/hooks/useMetaTags';
import { GameBoard } from '@/components/GameBoard';
import { QuestionView } from '@/components/QuestionView';
import { AnswerView } from '@/components/AnswerView';

const GamePage = () => {
  const { urlId } = useParams<{ urlId: string }>();
  const { game, loadGame } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Dynamic meta tags for game pages
  useMetaTags({
    title: game ? `${game.title} – Trivia` : 'Team Jeopardy',
    description: game 
      ? `Test your knowledge of ${game.categories.map(cat => cat.name).join(', ')} or create your own quiz`
      : 'Custom trivia games for you and your team.',
    ogTitle: game ? `${game.title} – Trivia` : 'Team Jeopardy',
    ogDescription: game 
      ? `Test your knowledge of ${game.categories.map(cat => cat.name).join(', ')} or create your own quiz`
      : 'Custom trivia games for you and your team.',
    ogImage: null,
    twitterTitle: game ? `${game.title} – Trivia` : 'Team Jeopardy',
    twitterDescription: game 
      ? `Test your knowledge of ${game.categories.map(cat => cat.name).join(', ')} or create your own quiz`
      : 'Custom trivia games for you and your team.',
    twitterImage: null,
  });

  useEffect(() => {
    if (!urlId) {
      setError(true);
      setLoading(false);
      return;
    }

    loadGame(urlId)
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load game:', error);
        setError(true);
        setLoading(false);
      });
  }, [urlId, loadGame]);

  if (loading) {
    return (
      <div className="min-h-screen bg-board-background flex items-center justify-center">
        <div className="text-primary-foreground text-xl">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return <Navigate to="/" />;
  }

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
};

export default GamePage;