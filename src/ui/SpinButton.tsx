import { useEffect, useRef, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types/game';
import { SoundManager } from '../pixi/SoundManager';
import { TurboToggle } from './TurboToggle';
import { AutoPlayPanel } from './AutoPlayPanel';

function useIsMobileLandscape() {
  const isTouchDevice = navigator.maxTouchPoints > 0;
  const [mobileLandscape, setMobileLandscape] = useState(
    isTouchDevice && window.innerWidth > window.innerHeight
  );
  useEffect(() => {
    const onResize = () => {
      setMobileLandscape(isTouchDevice && window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return mobileLandscape;
}

export function SpinButton() {
  const gameState = useGameStore((s) => s.gameState);
  const balance = useGameStore((s) => s.balance);
  const autoPlayRemaining = useGameStore((s) => s.autoPlayRemaining);
  const requestSpin = useGameStore((s) => s.requestSpin);
  const requestSkip = useGameStore((s) => s.requestSkip);
  const spaceHeld = useRef(false);
  const spaceInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMobileLandscape = useIsMobileLandscape();

  const isSpinning = gameState === GameState.Spinning;
  const isIdle = gameState === GameState.Idle;
  const canSpin = isIdle && balance >= 10;
  const isAutoPlaying = autoPlayRemaining > 0;

  const handleClick = () => {
    SoundManager.play('click', 0.5);
    if (isSpinning) {
      requestSkip();
    } else if (canSpin && !isAutoPlaying) {
      requestSpin();
    }
  };

  useEffect(() => {
    const doSpin = () => {
      const s = useGameStore.getState();
      const idle = s.gameState === GameState.Idle;
      const hasBalance = s.balance >= 10;
      if (idle && hasBalance) {
        useGameStore.getState().requestSpin();
      } else if (s.gameState === GameState.Spinning) {
        useGameStore.getState().requestSkip();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      spaceHeld.current = true;
      doSpin();
      spaceInterval.current = setInterval(doSpin, 200);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      spaceHeld.current = false;
      if (spaceInterval.current) {
        clearInterval(spaceInterval.current);
        spaceInterval.current = null;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (spaceInterval.current) clearInterval(spaceInterval.current);
    };
  }, []);

  if (gameState === GameState.Init || gameState === GameState.NameEntry) return null;

  let label = 'SPIN';
  let bgColor = 'cyan.500';
  let hoverColor = 'cyan.400';

  const isDisabled = isAutoPlaying || (!canSpin && !isSpinning);

  if (isAutoPlaying) {
    bgColor = 'gray.600';
    hoverColor = 'gray.600';
  } else if (isSpinning) {
    label = 'SKIP';
    bgColor = 'orange.500';
    hoverColor = 'orange.400';
  } else if (!canSpin) {
    bgColor = 'gray.600';
    hoverColor = 'gray.600';
  }

  const spinSize = isMobileLandscape ? '80px' : '120px';
  const sideSize = isMobileLandscape ? '40px' : '50px';
  const spinFontSize = isAutoPlaying ? 'xs' : (isMobileLandscape ? 'md' : 'lg');

  if (isMobileLandscape) {
    return (
      <Flex
        position="absolute"
        right="16px"
        top="50%"
        transform="translateY(-50%)"
        direction="column"
        align="center"
        gap={3}
        pointerEvents="auto"
      >
        <TurboToggle size={sideSize} />

        <Box
          as="button"
          onClick={handleClick}
          disabled={isDisabled}
          w={spinSize}
          h={spinSize}
          borderRadius="full"
          bg={bgColor}
          color="gray.900"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor={isDisabled ? 'not-allowed' : 'pointer'}
          opacity={isDisabled ? 0.5 : 1}
          border="3px solid"
          borderColor="whiteAlpha.400"
          boxShadow={`0 0 20px ${isSpinning ? '#FF8800' : '#00D4FF'}40`}
          transition="all 0.15s ease"
          _hover={{
            bg: hoverColor,
            transform: isDisabled ? 'none' : 'scale(1.05)',
          }}
          _active={{ transform: 'scale(0.95)' }}
        >
          <Text fontSize={spinFontSize} fontFamily="'Orbitron', sans-serif" fontWeight="800" letterSpacing="wider">
            {label}
          </Text>
        </Box>

        <AutoPlayPanel size={sideSize} />
      </Flex>
    );
  }

  return (
    <Flex
      position="absolute"
      bottom="70px"
      left="50%"
      transform="translateX(-50%)"
      direction="row"
      align="center"
      gap={4}
      pointerEvents="auto"
    >
      <TurboToggle size={sideSize} />

      <Box
        as="button"
        onClick={handleClick}
        disabled={isDisabled}
        w={spinSize}
        h={spinSize}
        borderRadius="full"
        bg={bgColor}
        color="gray.900"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor={isDisabled ? 'not-allowed' : 'pointer'}
        opacity={isDisabled ? 0.5 : 1}
        border="4px solid"
        borderColor="whiteAlpha.400"
        boxShadow={`0 0 30px ${isSpinning ? '#FF8800' : '#00D4FF'}40`}
        transition="all 0.15s ease"
        _hover={{
          bg: hoverColor,
          transform: isDisabled ? 'none' : 'scale(1.05)',
          boxShadow: `0 0 40px ${isSpinning ? '#FF8800' : '#00D4FF'}60`,
        }}
        _active={{ transform: 'scale(0.95)' }}
      >
        <Text fontSize={spinFontSize} fontFamily="'Orbitron', sans-serif" fontWeight="800" letterSpacing="wider">
          {label}
        </Text>
      </Box>

      <AutoPlayPanel size={sideSize} />
    </Flex>
  );
}
