'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Sword, TimerReset, Loader2 } from 'lucide-react';
import { BattleProps, BattleState } from './data';
import { useRouter } from 'next/navigation';

const INITIAL_STATE: BattleState = {
  currentPlayer: 1,
  timeLeft: 60,
  isActive: false,
  phase: 'waiting',
  player1: { prompt: '', imageUrl: null, isSubmitted: false },
  player2: { prompt: '', imageUrl: null, isSubmitted: false },
};

async function fetchGeneratedImage(prompt: string): Promise<string> {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

const PromptBattle: React.FC<BattleProps> = ({ sessionId, player1, player2, timeLimit }) => {
  const router = useRouter();
  const [battleState, setBattleState] = useState<BattleState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);

  const startBattle = () => {
    setBattleState(prev => ({
      ...prev,
      isActive: true,
      phase: 'player1-turn',
      timeLeft: timeLimit,
    }));
  };

  const resetBattle = () => {
    setBattleState(INITIAL_STATE);
    setError(null);
  };

  const handlePromptSubmit = async (playerNumber: 1 | 2) => {
    const currentPrompt = playerNumber === 1 ? 
      battleState.player1.prompt : 
      battleState.player2.prompt;

    if (!currentPrompt.trim()) {
      setError('Please enter a prompt before submitting');
      return;
    }

    setBattleState(prev => ({
      ...prev,
      phase: 'generating',
    }));

    try {
      const imageUrl = await fetchGeneratedImage(currentPrompt);
      
      setBattleState(prev => ({
        ...prev,
        [`player${playerNumber}`]: {
          ...prev[`player${playerNumber}`],
          imageUrl,
          isSubmitted: true,
        },
        phase: playerNumber === 1 ? 'player2-turn' : 'complete',
        currentPlayer: playerNumber === 1 ? 2 : 1,
        timeLeft: timeLimit,
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      setBattleState(prev => ({
        ...prev,
        phase: `player${playerNumber}-turn` as any,
      }));
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (battleState.isActive && 
        (battleState.phase === 'player1-turn' || battleState.phase === 'player2-turn')) {
      timer = setInterval(() => {
        setBattleState(prev => {
          if (prev.timeLeft <= 1) {
            handlePromptSubmit(prev.currentPlayer);
            return prev;
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [battleState.isActive, battleState.phase]);

  const isPlayer1Active = battleState.phase === 'player1-turn';
  const isPlayer2Active = battleState.phase === 'player2-turn';
  const isGenerating = battleState.phase === 'generating';

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Prompt Battle Arena</h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <TimerReset className="h-5 w-5" />
          <span className="text-xl font-mono">
            {isGenerating ? 'Generating...' : `${battleState.timeLeft}s`}
          </span>
        </div>
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={startBattle}
            className="bg-green-600 hover:bg-green-700"
            disabled={battleState.isActive}
          >
            Start Battle
          </Button>
          <Button 
            onClick={resetBattle}
            variant="outline"
          >
            Reset
          </Button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Player 1 Side */}
        <Card className={`p-4 ${isPlayer1Active ? 'ring-2 ring-yellow-500' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-6 w-6 text-yellow-500" />
            {/* Check */}
            <h2 className="text-xl font-bold">{player1}</h2> 
          </div>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
              {isGenerating && battleState.currentPlayer === 1 ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <img 
                  src={battleState.player1.imageUrl || "/api/placeholder/400/400"}
                  alt="Player 1 Generation" 
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Enter your prompt..."
                value={battleState.player1.prompt}
                onChange={(e) => setBattleState(prev => ({
                  ...prev,
                  player1: { ...prev.player1, prompt: e.target.value }
                }))}
                disabled={!isPlayer1Active || battleState.player1.isSubmitted}
                className="w-full"
              />
              <Button
                onClick={() => handlePromptSubmit(1)}
                disabled={!isPlayer1Active || battleState.player1.isSubmitted}
                className="w-full"
              >
                Submit Prompt
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Player 2 Side */}
        <Card className={`p-4 ${isPlayer2Active ? 'ring-2 ring-blue-500' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <Sword className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold">{player2}</h2>
          </div>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
              {isGenerating && battleState.currentPlayer === 2 ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <img 
                  src={battleState.player2.imageUrl || "/api/placeholder/400/400"}
                  alt="Player 2 Generation" 
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Enter your prompt..."
                value={battleState.player2.prompt}
                onChange={(e) => setBattleState(prev => ({
                  ...prev,
                  player2: { ...prev.player2, prompt: e.target.value }
                }))}
                disabled={!isPlayer2Active || battleState.player2.isSubmitted}
                className="w-full"
              />
              <Button
                onClick={() => handlePromptSubmit(2)}
                disabled={!isPlayer2Active || battleState.player2.isSubmitted}
                className="w-full"
              >
                Submit Prompt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromptBattle;