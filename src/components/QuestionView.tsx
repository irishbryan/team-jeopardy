import { Button } from '@/components/ui/button';
import { useGameStore } from '@/hooks/useGameStore';
import { ArrowLeft, Eye } from 'lucide-react';

export const QuestionView = () => {
  const { game, showAnswer, backToBoard } = useGameStore();

  if (!game?.currentQuestion) return null;

  const question = game.currentQuestion;

  return (
    <div className="min-h-screen bg-board-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full text-center space-y-6 md:space-y-12">
        {/* Category and Value */}
         <div className="space-y-2 md:space-y-4">
           <div className="text-secondary text-lg md:text-2xl font-semibold">
             CATEGORY
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

        {/* Question */}
         <div className="bg-board-question rounded-xl p-6 md:p-12 shadow-game">
           <p className="text-xl md:text-4xl leading-relaxed text-primary-foreground">
             {question.text}
           </p>
         </div>

        {/* Host Controls */}
         <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
           <Button
             variant="outline"
             size="lg"
             onClick={backToBoard}
             className="gap-2 text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
           >
             <ArrowLeft className="h-4 md:h-5 w-4 md:w-5" />
             Back to Board
           </Button>
           
           <Button
             variant="jeopardy-gold"
             size="lg"
             onClick={showAnswer}
             className="gap-2 text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
           >
             <Eye className="h-4 md:h-5 w-4 md:w-5" />
             View Answer
           </Button>
        </div>
      </div>
    </div>
  );
};