import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock } from 'lucide-react';
interface GameData {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  categories: any; // Can be array of objects or other JSON structure
}
export const GamesList = ({
  compact = false
}: {
  compact?: boolean;
}) => {
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('games').select('id, name, slug, created_at, categories').order('created_at', {
          ascending: false
        }).limit(10);
        if (error) {
          setError('Failed to load games');
          console.error('Error fetching games:', error);
        } else {
          setGames(data || []);
        }
      } catch (err) {
        setError('Failed to load games');
        console.error('Error fetching games:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };
  const getCategoryNames = (categories: any) => {
    if (!categories || !Array.isArray(categories)) return [];
    return categories.map((cat: any) => cat.name || cat).slice(0, 3); // Show first 3 categories
  };
  if (loading) {
    return <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary-foreground">
            Recent Games
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Quick access to your latest games
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading games...
          </div>
        </CardContent>
      </Card>;
  }
  if (error) {
    return <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary-foreground">
            Recent Games
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Quick access to your latest games
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-800">
          Recent Games
        </CardTitle>
        
      </CardHeader>
      <CardContent>
        {games.length === 0 ? <div className="text-center py-8 text-muted-foreground">
            No games created yet. Create your first game!
          </div> : <div className="space-y-4">
            {games.slice(0, compact ? 5 : 10).map(game => <div key={game.id} className="flex items-start justify-between p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer" onClick={() => navigate(`/game/${game.slug}`)}>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold transition-colors line-clamp-1 text-slate-800">
                    {game.name}
                  </h3>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    {formatDate(game.created_at)}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2 shrink-0" onClick={e => {
            e.stopPropagation();
            navigate(`/game/${game.slug}`);
          }}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>)}
            {compact && <div className="text-center pt-2">
                <Link to="/games">
                  <Button variant="link" className="text-sm text-muted-foreground">
                    View all games
                  </Button>
                </Link>
              </div>}
          </div>}
      </CardContent>
    </Card>;
};