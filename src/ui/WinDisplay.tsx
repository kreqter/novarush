import { Box, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types/game';

const pulse = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.9; }
`;

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 20px #FFD700, 0 0 40px #FFD700; }
  50% { text-shadow: 0 0 40px #FFD700, 0 0 80px #FF8800, 0 0 120px #FFD700; }
`;

export function WinDisplay() {
  const gameState = useGameStore((s) => s.gameState);
  const lastWin = useGameStore((s) => s.lastWin);

  if (lastWin <= 0) return null;
  if (gameState !== GameState.WinDisplay && gameState !== GameState.Idle) return null;

  return (
    <Box
      position="absolute"
      top="45%"
      left="50%"
      transform="translate(-50%, -50%)"
      pointerEvents="none"
      zIndex={100}
      animation={`${pulse} 0.8s ease-in-out infinite`}
    >
      <Text
        fontSize="5xl"
        fontFamily="'Orbitron', sans-serif"
        fontWeight="900"
        color="yellow.300"
        textAlign="center"
        animation={`${glow} 1s ease-in-out infinite`}
        letterSpacing="wider"
      >
        WIN
      </Text>
      <Text
        fontSize="6xl"
        fontFamily="'Orbitron', sans-serif"
        fontWeight="900"
        color="white"
        textAlign="center"
        animation={`${glow} 1s ease-in-out infinite`}
        letterSpacing="wider"
      >
        {lastWin.toLocaleString()}
      </Text>
    </Box>
  );
}
