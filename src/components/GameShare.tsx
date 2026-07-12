import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check } from 'lucide-react';

interface GameShareProps {
  urlId: string;
  gameTitle: string;
}

export const GameShare = ({ urlId, gameTitle }: GameShareProps) => {
  const [copied, setCopied] = useState(false);
  
  const gameUrl = `${window.location.origin}/game/${urlId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback: select the text for manual copying
      const input = document.querySelector('input[readonly]') as HTMLInputElement;
      if (input) {
        input.select();
        input.setSelectionRange(0, 99999);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Game
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{gameTitle}"</DialogTitle>
          <DialogDescription>
            Share this link with others to play this Jeopardy game together.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              key={gameUrl}
              value={gameUrl}
              readOnly
              className="text-sm"
            />
          </div>
          <Button 
            size="sm" 
            className={`px-3 transition-colors ${copied ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
            onClick={handleCopy}
          >
            <span className="sr-only">{copied ? 'Copied' : 'Copy'}</span>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};