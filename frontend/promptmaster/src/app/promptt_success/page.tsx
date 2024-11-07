'use client';

import React, { useState, useEffect } from 'react';
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
    <div className="w-full max-w-8xl mx-auto p-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg shadow-lg">
      {/* Top Image */}
      <div className="flex justify-center mb-4">
  <img 
    src="/9e85c8291c974faeaec9b59026f41b71.png" // Replace with your image path
    alt="Prompt Battle"
    className="h-48 w-auto object-contain" // Increased height to h-48
  />
</div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🎉 Prompt Battle Arena 🎉</h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <TimerReset className="h-6 w-6 text-white" />
          <span className="text-2xl font-mono text-white">
            {isGenerating ? 'Generating...' : `${battleState.timeLeft}s`}
          </span>
        </div>
        <div className="flex gap-2 justify-center mb-4">
          <Button 
            onClick={startBattle}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
            disabled={battleState.isActive}
          >
            Start Battle
          </Button>
          <Button 
            onClick={resetBattle}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            Reset
          </Button>
        </div>
        {error && <p className="text-red-300 mt-2">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player 1 Side */}
        <Card className={`p-4 bg-white rounded-lg shadow-lg ${isPlayer1Active ? 'ring-2 ring-yellow-500' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h2 className="text-2xl font-bold">{player1}</h2> 
          </div>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
              {isGenerating && battleState.currentPlayer === 1 ? (
                <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
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
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold"
              >
                Submit Prompt
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Player 2 Side */}
        <Card className={`p-4 bg-white rounded-lg shadow-lg ${isPlayer2Active ? 'ring-2 ring-blue-500' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <Sword className="h-8 w-8 text-blue-500" />
            <h2 className="text-2xl font-bold">{player2}</h2>
          </div>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
              {isGenerating && battleState.currentPlayer === 2 ? (
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
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