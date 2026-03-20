import { useEffect, useRef, useState } from 'react';
import { Box, ChakraProvider, extendTheme } from '@chakra-ui/react';
import { StartScreen } from './ui/StartScreen';
import { HUD } from './ui/HUD';
import { SpinButton } from './ui/SpinButton';
import { WinDisplay } from './ui/WinDisplay';
import { Paytable } from './ui/Paytable';
import { initGame } from './game';
import { useGameStore } from './store/gameStore';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Rajdhani', sans-serif",
  },
  colors: {
    brand: {
      primary: '#00D4FF',
      accent: '#FF00AA',
      gold: '#FFD700',
    },
  },
});

let gameInitialized = false;

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    gameInitialized = false;
  });
}

export function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const requestSkip = useGameStore((s) => s.requestSkip);

  useEffect(() => {
    if (!canvasRef.current || gameInitialized) return;
    gameInitialized = true;

    while (canvasRef.current.firstChild) {
      canvasRef.current.removeChild(canvasRef.current.firstChild);
    }

    initGame(canvasRef.current)
      .then(() => setReady(true))
      .catch((err) => console.error('initGame failed:', err));
  }, []);

  const handleCanvasClick = () => {
    requestSkip();
  };

  return (
    <ChakraProvider theme={theme}>
      <Box w="100vw" h="100vh" position="relative" overflow="hidden" bg="#040e2e">
        <Box
          ref={canvasRef}
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          zIndex={0}
          onClick={handleCanvasClick}
        />

        {ready && (
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            pointerEvents="none"
            zIndex={10}
          >
            <StartScreen />
            <HUD />
            <SpinButton />
            <WinDisplay />
            <Paytable />
          </Box>
        )}
      </Box>
    </ChakraProvider>
  );
}
