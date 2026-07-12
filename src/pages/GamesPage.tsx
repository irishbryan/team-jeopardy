import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar } from 'lucide-react';
interface GameData {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  categories: any;
}
const GamesPage = () => {
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchAllGames();
  }, []);
  const fetchAllGames = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('games').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setGames(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-board-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-lg text-primary-foreground">Loading games...</div>
          </div>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-board-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-red-400">
            Error loading games: {error}
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-board-background">
      {/* Breadcrumb Navigation */}
      <div className="bg-board-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center space-x-2 text-lg">
            <Link 
              to="/" 
              className="text-jeopardy-gold hover:text-jeopardy-gold/80 transition-colors font-semibold"
            >
              Host Jeopardy
            </Link>
            <span className="text-primary-foreground">»</span>
            <span className="text-primary-foreground font-semibold">All Games</span>
          </nav>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {games.length === 0 ? <div className="text-center py-12">
            <p className="text-lg text-primary-foreground mb-4">No games found</p>
            <Link to="/">
              <Button>Create Your First Game</Button>
            </Link>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {games.map(game => <Card key={game.id} className="bg-card border-border hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-card-foreground line-clamp-2 pr-2">
                      {game.name}
                    </CardTitle>
                    <Link to={`/game/${game.slug}`} className="flex-shrink-0">
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow pt-0">
                  {/* Categories - Fixed height section */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Categories:</p>
                    <div className="flex flex-wrap gap-1 min-h-[60px] overflow-hidden">
                      {Array.isArray(game.categories) ? game.categories.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((category: any, index: number) => <Badge key={index} variant="secondary" className="text-xs">
                              {category.name || category}
                            </Badge>) : <Badge variant="secondary" className="text-xs">
                          No categories
                        </Badge>}
                    </div>
                  </div>

                  {/* Spacer to push date and button to bottom */}
                  <div className="flex-grow"></div>

                  {/* Created Date - Fixed position from bottom */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDate(game.created_at)}</span>
                  </div>

                  {/* Play Button - Always at bottom */}
                  <div className="pt-3 border-t border-border">
                    <Link to={`/game/${game.slug}`} className="block">
                      <Button className="w-full">
                        Play Game
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </div>;
};
export default GamesPage;