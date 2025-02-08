import React, { useState, useCallback, useEffect } from 'react';
import { Trophy, RotateCcw, Sparkles, Crown, Target, Zap, Star, Shield, Flame, Award } from 'lucide-react';
import Bat from './assets/kohil.jpg';
import Ball from './assets/bumrah.jpg';
import Stump from './assets/dhoni.jpg';

const INITIAL_SCORE = {
  win: 0,
  lost: 0,
  tie: 0,
  streak: 0,
  highestStreak: 0,
  powerMeter: 0,
  experience: 0,
  level: 1,
};

const WINNING_STREAKS = {
  3: '🔥 Three in a row!',
  5: '🌟 Fantastic five!',
  10: '🏆 Perfect ten!',
  15: '👑 Unstoppable!',
};

const getPowerLevelColor = (level) => {
  const colors = {
    normal: 'from-blue-500 to-purple-500',
    super: 'from-yellow-500 to-orange-500',
    ultra: 'from-purple-600 to-pink-600',
    legendary: 'from-red-600 to-yellow-500',
  };
  return colors[level];
};

const getBackgroundGradient = (level) => {
  const gradients = {
    normal: 'from-[#FF9933] via-[#ffffff] to-[#138808]',
    super: 'from-yellow-400 via-orange-500 to-red-500',
    ultra: 'from-purple-600 via-pink-500 to-orange-500',
    legendary: 'from-red-600 via-yellow-500 to-purple-600',
  };
  return gradients[level];
};

function App() {
  const [userChoice, setUserChoice] = useState('');
  const [computerChoice, setComputerChoice] = useState('');
  const [result, setResult] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [powerLevel, setPowerLevel] = useState('normal');
  const [lastWinTime, setLastWinTime] = useState(Date.now());
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showPowerAnimation, setShowPowerAnimation] = useState(false);
  const [lastMove, setLastMove] = useState('');
  const [score, setScore] = useState(() => {
    const savedScore = localStorage.getItem('Score');
    return savedScore ? JSON.parse(savedScore) : INITIAL_SCORE;
  });

  // Save score to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('Score', JSON.stringify(score));
  }, [score]);

  const playSound = useCallback((result) => {
    const audio = new Audio(
      result === 'win' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'
        : result === 'lost'
        ? 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'
        : 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3'
    );
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }, []);

  const generateComputerChoice = useCallback(() => {
    const choices = ['Bat', 'Ball', 'Stump'];
    if (powerLevel !== 'normal') {
      const playerFavoredChoices = [
        ...choices,
        ...Array(powerLevel === 'legendary' ? 3 : powerLevel === 'ultra' ? 2 : 1).fill(choices[Math.floor(Math.random() * 3)])
      ];
      return playerFavoredChoices[Math.floor(Math.random() * playerFavoredChoices.length)];
    }
    return choices[Math.floor(Math.random() * 3)];
  }, [powerLevel]);

  const getResult = useCallback((userMove, computerMove) => {
    const outcomes = {
      Bat: { Bat: 'tie', Ball: 'win', Stump: 'lost' },
      Ball: { Bat: 'lost', Ball: 'tie', Stump: 'win' },
      Stump: { Bat: 'win', Ball: 'lost', Stump: 'tie' }
    };
    return outcomes[userMove][computerMove];
  }, []);

  const updateScore = useCallback((gameResult) => {
    const now = Date.now();
    const timeSinceLastWin = now - lastWinTime;
    const newComboMultiplier = timeSinceLastWin < 2000 ? Math.min(comboMultiplier + 1, 5) : 1;

    setScore(prev => {
      const powerMultiplier = 
        powerLevel === 'legendary' ? 4 :
        powerLevel === 'ultra' ? 3 :
        powerLevel === 'super' ? 2 : 1;

      const basePoints = gameResult === 'win' ? 20 : gameResult === 'tie' ? 5 : 0;
      const points = basePoints * newComboMultiplier * powerMultiplier;
      
      const newStreak = gameResult === 'win' ? prev.streak + 1 : 0;
      const newHighestStreak = Math.max(prev.highestStreak, newStreak);
      const newExperience = prev.experience + points;
      const newLevel = Math.floor(newExperience / 100) + 1;
      
      const powerIncrease = gameResult === 'win' ? 25 * newComboMultiplier : -15;
      const newPowerMeter = Math.min(Math.max(prev.powerMeter + powerIncrease, 0), 100);

      return {
        ...prev,
        [gameResult]: prev[gameResult] + 1,
        streak: newStreak,
        highestStreak: newHighestStreak,
        powerMeter: newPowerMeter,
        experience: newExperience,
        level: newLevel,
      };
    });

    if (gameResult === 'win') {
      setLastWinTime(now);
      setComboMultiplier(newComboMultiplier);
    } else {
      setComboMultiplier(1);
    }
  }, [lastWinTime, comboMultiplier, powerLevel]);

  const handleChoice = useCallback(async (choice) => {
    setIsAnimating(true);
    setShowConfetti(false);
    setLastMove(choice);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const compChoice = generateComputerChoice();
    const gameResult = getResult(choice, compChoice);
    
    setUserChoice(choice);
    setComputerChoice(compChoice);
    setResult(gameResult);
    updateScore(gameResult);
    
    if (gameResult === 'win') {
      setShowConfetti(true);
      setShowPowerAnimation(true);
      setTimeout(() => setShowPowerAnimation(false), 1000);
    }
    
    setIsAnimating(false);
    playSound(gameResult);
  }, [generateComputerChoice, getResult, playSound, updateScore]);

  useEffect(() => {
    const powerLevels = {
      100: 'super',
      200: 'ultra',
      300: 'legendary',
    };

    const newPowerLevel = Object.entries(powerLevels)
      .reverse()
      .find(([threshold]) => score.experience >= Number(threshold))?.[1] || 'normal';

    if (newPowerLevel !== powerLevel) {
      setPowerLevel(newPowerLevel);
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3');
      audio.volume = 0.7;
      audio.play().catch(() => {});
    }
  }, [score.experience, powerLevel]);

  const resetGame = () => {
    setScore(INITIAL_SCORE);
    setUserChoice('');
    setComputerChoice('');
    setResult('');
    setShowConfetti(false);
    setPowerLevel('normal');
    setComboMultiplier(1);
    setLastMove('');
    localStorage.removeItem('Score'); // Clear localStorage
  };

  const getStreakMessage = (streak) => {
    const thresholds = Object.keys(WINNING_STREAKS).map(Number).sort((a, b) => b - a);
    for (const threshold of thresholds) {
      if (streak >= threshold) {
        return WINNING_STREAKS[threshold];
      }
    }
    return '';
  };

  const getImage = (choice) => {
    const images = {
      Bat: Bat,
      Ball: Ball,
      Stump: Stump
    };
    return images[choice];
  };

  return (
    <div className={`
      min-h-screen transition-colors duration-1000
      bg-gradient-to-br ${getBackgroundGradient(powerLevel)}
      flex items-center justify-center p-4 overflow-hidden
      relative
    `}>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none animate-confetti">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
        </div>
      )}

      {powerLevel !== 'normal' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              {powerLevel === 'legendary' ? (
                <Star className="text-yellow-300 w-6 h-6 opacity-75" />
              ) : powerLevel === 'ultra' ? (
                <Sparkles className="text-purple-300 w-6 h-6 opacity-75" />
              ) : (
                <Flame className="text-orange-300 w-6 h-6 opacity-75" />
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className={`
        w-full max-w-2xl bg-white rounded-xl overflow-hidden
        transform transition-all duration-500
        ${powerLevel !== 'normal' ? `shadow-[0_0_50px_rgba(255,182,193,0.5)]` : 'shadow-xl hover:shadow-2xl'}
        ${showPowerAnimation ? 'animate-pulse' : ''}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <Trophy className={`
              w-8 h-8 mr-2
              ${powerLevel !== 'normal' ? 'text-yellow-500 animate-pulse' : 'text-yellow-500'}
            `} />
            <h1 className="text-3xl font-bold text-gray-800">Cricket Game</h1>
            {powerLevel !== 'normal' && (
              <div className="flex items-center ml-2">
                <Zap className="w-8 h-8 text-yellow-500 animate-bounce" />
                <span className={`
                  ml-2 font-bold
                  ${powerLevel === 'legendary' ? 'text-red-600' :
                    powerLevel === 'ultra' ? 'text-purple-600' :
                    'text-orange-600'}
                `}>
                  {powerLevel.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 mr-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getPowerLevelColor(powerLevel)} transition-all duration-300`}
                  style={{ width: `${score.powerMeter}%` }}
                />
              </div>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-500 mr-1" />
              <span className="text-sm font-bold text-gray-700">Level {score.level}</span>
            </div>
          </div>

          {comboMultiplier > 1 && (
            <div className="text-center mb-4">
              <span className={`
                inline-block px-3 py-1 rounded-full text-sm font-bold
                ${powerLevel === 'legendary' ? 'bg-red-100 text-red-700' :
                  powerLevel === 'ultra' ? 'bg-purple-100 text-purple-700' :
                  'bg-orange-100 text-orange-700'}
                animate-pulse
              `}>
                {comboMultiplier}x Combo!
              </span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            {['Bat', 'Ball', 'Stump'].map((choice) => (
              <button
                key={choice}
                onClick={() => !isAnimating && handleChoice(choice)}
                disabled={isAnimating}
                className={`
                  group relative overflow-hidden aspect-square rounded-lg
                  transform transition-all duration-300
                  ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'}
                  ${choice === lastMove ? 'ring-2 ring-blue-500' : ''}
                  ${powerLevel !== 'normal' ? `ring-2 ring-${getPowerLevelColor(powerLevel).split('-')[1]}-500 ring-opacity-50` : ''}
                `}
              >
                <img 
                  src={getImage(choice)}
                  alt={choice}
                  className={`
                    w-full h-full object-cover
                    transition-transform duration-300
                    group-hover:scale-110
                    ${powerLevel !== 'normal' ? 'saturate-150' : ''}
                  `}
                />
                <div className="
                  absolute inset-0 flex items-center justify-center
                  bg-gradient-to-t from-black/60 to-transparent
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                ">
                  <span className={`
                    text-white font-semibold text-lg px-4 py-2
                    rounded-full bg-black/40 backdrop-blur-sm
                    transform translate-y-4 group-hover:translate-y-0
                    transition-transform duration-300
                    ${powerLevel !== 'normal' ? 'text-yellow-300' : ''}
                  `}>{choice}</span>
                </div>
              </button>
            ))}
          </div>

          {(userChoice || computerChoice) && (
            <div className="space-y-4 mb-6 animate-fadeIn">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Your Choice:</span>
                <div className="flex items-center">
                  <img 
                    src={getImage(userChoice)} 
                    alt={userChoice}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="ml-2 text-base font-medium text-gray-800">
                    {userChoice}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Computer's Choice:</span>
                <div className="flex items-center">
                  {computerChoice && (
                    <>
                      <img 
                        src={getImage(computerChoice)} 
                        alt={computerChoice}
                        className="w-12 h-12 rounded-full object-cover animate-spin-once"
                      />
                      <span className="ml-2 text-base font-medium text-gray-800">
                        {computerChoice}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {result && (
                <div className={`
                  text-center p-4 rounded-lg
                  ${result === 'win' 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
                    : result === 'lost'
                    ? 'bg-gradient-to-r from-red-50 to-rose-50'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50'}
                  animate-bounce
                `}>
                  <span className="text-xl font-bold">
                    {result === 'win' && '🎉 You Won!'}
                    {result === 'lost' && '😔 Computer Won'}
                    {result === 'tie' && '🤝 It\'s a Tie!'}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center justify-center">
              <Award className={`w-5 h-5 mr-2 ${powerLevel !== 'normal' ? 'text-yellow-500' : 'text-yellow-500'}`} />
              Score Board
            </h3>
            
            {score.streak > 0 && (
              <div className="mb-4 text-center">
                <div className={`
                  inline-flex items-center px-4 py-2 rounded-full
                  ${powerLevel !== 'normal' ? 'bg-yellow-100' : 'bg-yellow-100'}
                `}>
                  <Target className={`w-5 h-5 mr-2 ${powerLevel !== 'normal' ? 'text-yellow-600' : 'text-yellow-600'}`} />
                  <span className={powerLevel !== 'normal' ? 'text-yellow-800' : 'text-yellow-800'}>
                    Streak: {score.streak}
                  </span>
                </div>
                {getStreakMessage(score.streak) && (
                  <div className="mt-2 text-lg font-bold text-indigo-600 animate-bounce">
                    {getStreakMessage(score.streak)}
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-100 p-3 rounded-lg transform hover:scale-105 transition-transform">
                <div className="font-bold text-2xl text-green-700">{score.win}</div>
                <div className="text-sm text-green-600">Wins</div>
              </div>
              <div className="bg-red-100 p-3 rounded-lg transform hover:scale-105 transition-transform">
                <div className="font-bold text-2xl text-red-700">{score.lost}</div>
                <div className="text-sm text-red-600">Losses</div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg transform hover:scale-105 transition-transform">
                <div className="font-bold text-2xl text-blue-700">{score.tie}</div>
                <div className="text-sm text-blue-600">Ties</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Experience:</span>
                <span>{score.experience} / {score.level * 100}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${(score.experience % 100)}%` }}
                />
              </div>
              {score.highestStreak > 0 && (
                <div className="text-center text-sm text-gray-600">
                  Highest Streak: {score.highestStreak}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={resetGame}
            className={`
              w-full flex items-center justify-center space-x-2 py-3 rounded-lg
              transform transition-all duration-300 hover:scale-105
              ${powerLevel !== 'normal'
                ? `bg-gradient-to-r ${getPowerLevelColor(powerLevel)} text-white`
                : 'bg-gray-800 text-white hover:bg-gray-700'}
            `}
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset Game</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;