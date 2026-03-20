import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  Input, Button, VStack, Text, Box,
} from '@chakra-ui/react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types/game';

export function StartScreen() {
  const [name, setName] = useState('');
  const gameState = useGameStore((s) => s.gameState);
  const setPlayerName = useGameStore((s) => s.setPlayerName);

  const isOpen = gameState === GameState.Init || gameState === GameState.NameEntry;

  const handlePlay = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    setPlayerName(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handlePlay();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} isCentered closeOnOverlayClick={false} size="md">
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
      <ModalContent bg="gray.900" border="1px solid" borderColor="cyan.500" borderRadius="xl" p={4}>
        <ModalHeader textAlign="center" p={2}>
          <Text
            fontSize="3xl"
            fontFamily="'Orbitron', sans-serif"
            fontWeight="800"
            bgGradient="linear(to-r, cyan.400, purple.500)"
            bgClip="text"
          >
            NOVA RUSH
          </Text>
          <Text fontSize="sm" color="gray.400" mt={1}>
            Cosmic Slot Machine
          </Text>
        </ModalHeader>
        <ModalBody>
          <VStack spacing={5} pb={4}>
            <Box w="100%">
              <Text fontSize="sm" color="gray.300" mb={2}>
                Enter your name to begin
              </Text>
              <Input
                placeholder="Player name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                size="lg"
                bg="gray.800"
                border="1px solid"
                borderColor="gray.600"
                color="white"
                fontFamily="'Rajdhani', sans-serif"
                fontSize="xl"
                _focus={{ borderColor: 'cyan.400', boxShadow: '0 0 0 1px #00D4FF' }}
                _placeholder={{ color: 'gray.500' }}
                maxLength={20}
                autoFocus
              />
            </Box>
            <Button
              onClick={handlePlay}
              isDisabled={name.trim().length === 0}
              w="100%"
              size="lg"
              bg="cyan.500"
              color="gray.900"
              fontFamily="'Orbitron', sans-serif"
              fontWeight="700"
              fontSize="xl"
              _hover={{ bg: 'cyan.400', transform: 'scale(1.02)' }}
              _active={{ bg: 'cyan.600' }}
              _disabled={{ bg: 'gray.600', cursor: 'not-allowed' }}
              transition="all 0.2s"
            >
              PLAY
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
