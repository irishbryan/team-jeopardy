import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/useGameStore';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export const AnswerView = () => {
  const { game, backToBoard, markAnswered } = useGameStore();

  if (!game?.currentQuestion || !game.showAnswer) return null;

  const question = game.currentQuestion;

  const handleBackToQuiz = () => {
    markAnswered(question.id);
    backToBoard();
  };

  return (
    <div className="min-h-screen bg-board-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full text-center space-y-6 md:space-y-12">
        {/* Category and Value */}
         <div className="space-y-2 md:space-y-4">
           <div className="text-secondary text-lg md:text-2xl font-semibold">
             ANSWER
           </div>
           <div className="text-3xl md:text-6xl font-bold text-primary-foreground mb-4 md:mb-8">
             {game.categories.find(cat => 
               cat.questions.some(q => q.id === question.id)
             )?.name}
           </div>
         </div>

        {/* Value */}
         <div className="bg-gradient-gold text-jeopardy-blue rounded-xl p-4 md:p-6 inline-block shadow-glow">
           <div className="text-2xl md:text-4xl font-bold">
             ${question.value}
           </div>
         </div>

        {/* Question (smaller) */}
         <div className="bg-board-question rounded-xl p-4 md:p-6 shadow-game opacity-75">
           <p className="text-lg md:text-2xl text-primary-foreground">
             {question.text}
           </p>
         </div>

         {/* Answer */}
         <div className="bg-gradient-jeopardy rounded-xl p-6 md:p-12 shadow-glow transform scale-105">
           <p className="text-2xl md:text-5xl leading-relaxed text-primary-foreground font-bold">
            {question.answer}
          </p>
        </div>

        {/* Host Controls */}
         <div className="flex justify-center">
           <Button
             variant="jeopardy-gold"
             size="lg"
             onClick={handleBackToQuiz}
             className="gap-2 text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
           >
             <ArrowLeft className="h-4 md:h-5 w-4 md:w-5" />
             Back to Board
           </Button>
        </div>
      </div>
    </div>
  );
};