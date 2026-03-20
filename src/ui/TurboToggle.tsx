import { Box, Text } from '@chakra-ui/react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types/game';
import { SoundManager } from '../pixi/SoundManager';

export function TurboToggle({ size = '50px' }: { size?: string }) {
  const gameState = useGameStore((s) => s.gameState);
  const turboActive = useGameStore((s) => s.turboActive);
  const toggleTurbo = useGameStore((s) => s.toggleTurbo);

  if (gameState === GameState.Init || gameState === GameState.NameEntry) return null;

  const handleToggle = () => {
    SoundManager.play('click', 0.5);
    toggleTurbo();
  };

  return (
    <Box
      as="button"
      onClick={handleToggle}
      w={size}
      h={size}
      borderRadius="full"
      bg={turboActive ? 'yellow.500' : 'gray.700'}
      color={turboActive ? 'gray.900' : 'yellow.400'}
      border="2px solid"
      borderColor={turboActive ? 'yellow.300' : 'gray.600'}
      boxShadow={turboActive ? '0 0 20px #FFD70060' : 'none'}
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        bg: turboActive ? 'yellow.400' : 'gray.600',
        transform: 'scale(1.1)',
      }}
      pointerEvents="auto"
    >
      <Text fontSize="xl">&#x26A1;</Text>
    </Box>
  );
}
