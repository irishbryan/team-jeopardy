import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Settings, AlertCircle } from 'lucide-react';
import { useGameStore } from '@/hooks/useGameStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
export const GameCreation = ({
  showHeader = true
}: {
  showHeader?: boolean;
}) => {
  const navigate = useNavigate();
  const [gameTitle, setGameTitle] = useState('');
  const [defaultCategories, setDefaultCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showCustomization, setShowCustomization] = useState(false);
  const [error, setError] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const createGame = useGameStore(state => state.createGame);
  const availableCategories = ['History', 'Science', 'Sports', 'Movies', 'Geography', 'Literature'];

  // Always use exactly 6 categories - randomize on mount
  useEffect(() => {
    const shuffled = [...availableCategories].sort(() => 0.5 - Math.random());
    setDefaultCategories(shuffled);
    setCategories(shuffled);
  }, []);
  const updateCategory = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
  };
  const handleCreateGame = async () => {
    if (!gameTitle.trim()) return;
    setError('');
    setIsCreating(true);
    try {
      // Ensure we always have exactly 6 categories
      const finalCategories = categories.length === 6 ? categories : defaultCategories;
      const urlId = await createGame(gameTitle, finalCategories);
      navigate(`/game/${urlId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  return <div className={showHeader ? "min-h-screen bg-board-background flex items-center justify-center p-4" : ""}>
      <Card className="w-full shadow-game">
        {showHeader && <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-4xl font-bold bg-gradient-jeopardy bg-clip-text text-transparent">
              Create Jeopardy Game
            </CardTitle>
            <CardDescription className="text-base md:text-lg">
              Set up your game, you can choose your categories if you like
            </CardDescription>
          </CardHeader>}
        
        {!showHeader && <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Create New Game
            </CardTitle>
            
          </CardHeader>}
        
        <CardContent className="space-y-6">{/* Remove conditional padding */}
          <div className="space-y-2">
            <Label htmlFor="game-title" className="text-base md:text-lg font-semibold">
              Name
            </Label>
            <Input id="game-title" placeholder="Birthday Party, Offsite, ..." value={gameTitle} onChange={e => setGameTitle(e.target.value)} className="text-base md:text-lg h-10 md:h-12" />
          </div>


          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base md:text-lg font-semibold">
                Categories
              </Label>
              <Button variant="ghost" size="sm" onClick={() => setShowCustomization(!showCustomization)} className="gap-2 text-sm">
                <Settings className="h-4 w-4" />
                Customize Categories
              </Button>
            </div>

            {!showCustomization && <div className="space-y-1">
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {defaultCategories.map((category, index) => <div key={index} className="bg-muted rounded-lg px-2 py-2 text-xs sm:text-sm font-medium text-center">
                      {category}
                    </div>)}
                </div>
              </div>}

            {showCustomization && <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Customize your 6 categories:
                  </p>
                </div>
                
                <div className="space-y-3">
                  {categories.map((category, index) => <div key={index} className="flex gap-2">
                      <Input placeholder={`Category ${index + 1}...`} value={category} onChange={e => updateCategory(index, e.target.value)} className="flex-1" />
                    </div>)}
                </div>
              </div>}
          </div>

          {error && <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>}

          <Button variant="jeopardy" size="lg" onClick={handleCreateGame} disabled={!gameTitle.trim() || isCreating} className="w-full text-lg md:text-xl py-4 md:py-6">
            {isCreating ? 'Creating Game (takes 60 seconds)...' : 'Create Game'}
          </Button>
        </CardContent>
      </Card>
    </div>;
};