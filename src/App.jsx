import React, { useState } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import Bat from './assets/kohil.jpg';
import Ball from './assets/bumrah.jpg';
import Stump from './assets/dhoni.jpg';

function App() {
  const [userChoice, setUserChoice] = useState('');
  const [computerChoice, setComputerChoice] = useState('');
  const [result, setResult] = useState('');
  const [score, setScore] = useState(() => {
    const savedScore = localStorage.getItem('Score');
    return savedScore ? JSON.parse(savedScore) : {
      win: 0,
      lost: 0,
      tie: 0,
    };
  });

  const generateComputerChoice = () => {
    const choices = ['Bat', 'Ball', 'Stump'];
    return choices[Math.floor(Math.random() * 3)];
  };

  const getResult = (userMove, computerMove) => {
    const outcomes = {
      Bat: { Bat: 'tie', Ball: 'win', Stump: 'lost' },
      Ball: { Bat: 'lost', Ball: 'tie', Stump: 'win' },
      Stump: { Bat: 'win', Ball: 'lost', Stump: 'tie' }
    };

    return outcomes[userMove][computerMove];
  };

  const handleChoice = (choice) => {
    const compChoice = generateComputerChoice();
    setUserChoice(choice);
    setComputerChoice(compChoice);
    
    const gameResult = getResult(choice, compChoice);
    setResult(gameResult);
    
    setScore(prev => {
      const newScore = {
        ...prev,
        [gameResult]: prev[gameResult] + 1
      };
      localStorage.setItem('Score', JSON.stringify(newScore));
      return newScore;
    });
  };

  const resetGame = () => {
    localStorage.clear();
    setScore({ win: 0, lost: 0, tie: 0 });
    setUserChoice('');
    setComputerChoice('');
    setResult('');
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
    <div className="min-h-screen bg-gradient-to-br from-[#FF9933] via-[#ffffff] to-[#138808] flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(to bottom right, #FF9933, #ffffff, #138808, #4B0082)' }}>
      <div className="w-full max-w-2xl mx-4 bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <Trophy className="w-8 h-8 text-yellow-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">Cricket Game</h1>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {['Bat', 'Ball', 'Stump'].map((choice) => (
              <button
                key={choice}
                onClick={() => handleChoice(choice)}
                className="group relative overflow-hidden aspect-square rounded-lg hover:scale-105 transition-transform duration-300"
              >
                <img 
                  src={getImage(choice)}
                  alt={choice}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white font-semibold text-lg">{choice}</span>
                </div>
              </button>
            ))}
          </div>

          {(userChoice || computerChoice) && (
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Your Choice:</span>
                <div className="flex items-center">
                  <img 
                    src={getImage(userChoice)} 
                    alt={userChoice}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="ml-2 text-base font-medium text-gray-800">{userChoice}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Computer's Choice:</span>
                <div className="flex items-center">
                  <img 
                    src={getImage(computerChoice)} 
                    alt={computerChoice}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="ml-2 text-base font-medium text-gray-800">{computerChoice}</span>
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <span className="text-xl font-bold">
                  {result === 'win' && '🎉 You Won!'}
                  {result === 'lost' && '😔 Computer Won'}
                  {result === 'tie' && '🤝 It\'s a Tie!'}
                </span>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Score Board</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <div className="font-bold text-2xl text-green-700 mb-1">{score.win}</div>
                <div className="text-sm text-green-600">Wins</div>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <div className="font-bold text-2xl text-red-700 mb-1">{score.lost}</div>
                <div className="text-sm text-red-600">Losses</div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <div className="font-bold text-2xl text-blue-700 mb-1">{score.tie}</div>
                <div className="text-sm text-blue-600">Ties</div>
              </div>
            </div>
          </div>

          <button
            onClick={resetGame}
            className="w-full flex items-center justify-center space-x-2 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors duration-300 text-base"
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