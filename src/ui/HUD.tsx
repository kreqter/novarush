import { Box, Flex, Text } from '@chakra-ui/react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types/game';

export function HUD() {
  const balance = useGameStore((s) => s.balance);
  const playerName = useGameStore((s) => s.playerName);
  const lastWin = useGameStore((s) => s.lastWin);
  const gameState = useGameStore((s) => s.gameState);

  if (gameState === GameState.Init || gameState === GameState.NameEntry) return null;

  return (
    <Flex
      position="absolute"
      bottom="0"
      left="0"
      right="0"
      bg="blackAlpha.800"
      backdropFilter="blur(5px)"
      px={6}
      py={3}
      justify="space-between"
      align="center"
      borderTop="1px solid"
      borderColor="whiteAlpha.200"
      pointerEvents="auto"
    >
      <Box w="160px">
        <Text fontSize="xs" color="gray.500" fontFamily="'Orbitron', sans-serif">
          PLAYER
        </Text>
        <Text fontSize="md" color="cyan.300" fontFamily="'Rajdhani', sans-serif" fontWeight="600" noOfLines={1}>
          {playerName}
        </Text>
      </Box>

      <Box textAlign="center" w="200px">
        <Text fontSize="xs" color="gray.500" fontFamily="'Orbitron', sans-serif">
          BALANCE
        </Text>
        <Text fontSize="xl" color="white" fontFamily="'Orbitron', sans-serif" fontWeight="700">
          {balance.toLocaleString()}
        </Text>
      </Box>

      <Box textAlign="center" w="100px">
        <Text fontSize="xs" color="gray.500" fontFamily="'Orbitron', sans-serif">
          BET
        </Text>
        <Text fontSize="xl" color="yellow.300" fontFamily="'Orbitron', sans-serif" fontWeight="700">
          10
        </Text>
      </Box>

      <Box textAlign="right" w="200px">
        <Text fontSize="xs" color="gray.500" fontFamily="'Orbitron', sans-serif">
          WIN
        </Text>
        <Text
          fontSize="xl"
          fontFamily="'Orbitron', sans-serif"
          fontWeight="700"
          color={lastWin > 0 && (gameState === GameState.WinDisplay || gameState === GameState.Idle) ? 'yellow.300' : 'gray.600'}
        >
          {lastWin > 0 ? lastWin.toLocaleString() : '\u2014'}
        </Text>
      </Box>
    </Flex>
  );
}
