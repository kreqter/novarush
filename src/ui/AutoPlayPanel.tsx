import {
  Box, Button, Popover, PopoverTrigger, PopoverContent,
  PopoverBody, HStack, Text,
} from '@chakra-ui/react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types/game';
import { GAME_CONFIG } from '../config/game';
import { SoundManager } from '../pixi/SoundManager';

export function AutoPlayPanel({ size = '50px' }: { size?: string }) {
  const gameState = useGameStore((s) => s.gameState);
  const autoPlayRemaining = useGameStore((s) => s.autoPlayRemaining);
  const startAutoPlay = useGameStore((s) => s.startAutoPlay);
  const stopAutoPlay = useGameStore((s) => s.stopAutoPlay);

  if (gameState === GameState.Init || gameState === GameState.NameEntry) return null;

  const isAutoPlaying = autoPlayRemaining > 0;

  const handleSelect = (count: number) => {
    SoundManager.play('click', 0.5);
    startAutoPlay(count);
  };

  const handleStop = () => {
    SoundManager.play('click', 0.5);
    stopAutoPlay();
  };

  if (isAutoPlaying) {
    return (
      <Box
        as="button"
        onClick={handleStop}
        w={size}
        h={size}
        borderRadius="full"
        bg="red.600"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        border="2px solid"
        borderColor="red.400"
        transition="all 0.2s"
        _hover={{ bg: 'red.500', transform: 'scale(1.1)' }}
        pointerEvents="auto"
      >
        <Text fontSize="9px" fontFamily="'Orbitron', sans-serif" fontWeight="700" lineHeight="1.1" textAlign="center">
          STOP<br/>{autoPlayRemaining}
        </Text>
      </Box>
    );
  }

  return (
    <Popover placement="top-start">
      <PopoverTrigger>
        <Box
          as="button"
          w="50px"
          h="50px"
          borderRadius="full"
          bg="gray.700"
          color="cyan.300"
          border="2px solid"
          borderColor="cyan.700"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ bg: 'gray.600', transform: 'scale(1.1)' }}
          pointerEvents="auto"
        >
          <Text fontSize="xs" fontFamily="'Orbitron', sans-serif" fontWeight="700" px={1}>
            AUTO
          </Text>
        </Box>
      </PopoverTrigger>
      <PopoverContent bg="gray.800" border="1px solid" borderColor="cyan.700" w="auto">
        <PopoverBody p={2}>
          <Text fontSize="xs" color="gray.400" mb={2} fontFamily="'Orbitron', sans-serif">
            AUTO SPINS
          </Text>
          <HStack spacing={2}>
            {GAME_CONFIG.AUTO_PLAY_OPTIONS.map((count) => (
              <Button
                key={count}
                onClick={() => handleSelect(count)}
                size="sm"
                bg="gray.700"
                color="cyan.300"
                fontFamily="'Rajdhani', sans-serif"
                fontWeight="700"
                _hover={{ bg: 'cyan.700', color: 'white' }}
              >
                {count}
              </Button>
            ))}
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
