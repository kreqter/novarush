import {
  Box, Text, Table, Thead, Tbody, Tr, Th, Td,
  Popover, PopoverTrigger, PopoverContent, PopoverBody,
  IconButton,
} from '@chakra-ui/react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types/game';
import { SYMBOL_CONFIGS } from '../config/symbols';
import { PAYTABLE } from '../config/paytable';
import { SymbolType } from '../types/symbols';

const symbolOrder: SymbolType[] = [
  SymbolType.Bar, SymbolType.Seven, SymbolType.Watermelon,
  SymbolType.Plum, SymbolType.Orange, SymbolType.Lemon, SymbolType.Cherry,
];

const SYMBOL_EMOJI: Partial<Record<SymbolType, string>> = {
  [SymbolType.Cherry]: '\uD83E\uDEA8',
  [SymbolType.Lemon]: '\u2604\uFE0F',
  [SymbolType.Orange]: '\uD83D\uDEF0',
  [SymbolType.Plum]: '\uD83E\uDE90',
  [SymbolType.Watermelon]: '\uD83D\uDEF8',
  [SymbolType.Seven]: '\uD83D\uDC8E',
  [SymbolType.Bar]: '\uD83D\uDE80',
};

export function Paytable() {
  const gameState = useGameStore((s) => s.gameState);

  if (gameState === GameState.Init || gameState === GameState.NameEntry) return null;

  return (
    <Box position="absolute" top="10px" right="10px" pointerEvents="auto">
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <IconButton
            aria-label="Paytable"
            size="sm"
            borderRadius="md"
            bg="gray.700"
            color="cyan.300"
            border="1px solid"
            borderColor="gray.600"
            _hover={{ bg: 'gray.600' }}
            icon={<Text fontSize="sm">?</Text>}
          />
        </PopoverTrigger>
        <PopoverContent bg="gray.900" border="1px solid" borderColor="cyan.700" w="320px">
          <PopoverBody p={3}>
            <Text
              fontSize="sm"
              fontFamily="'Orbitron', sans-serif"
              color="cyan.300"
              mb={2}
              textAlign="center"
            >
              PAYTABLE
            </Text>
            <Table size="sm" variant="unstyled">
              <Thead>
                <Tr>
                  <Th color="gray.500" fontSize="xs">Symbol</Th>
                  <Th color="gray.500" fontSize="xs" isNumeric>x3</Th>
                  <Th color="gray.500" fontSize="xs" isNumeric>x4</Th>
                  <Th color="gray.500" fontSize="xs" isNumeric>x5</Th>
                </Tr>
              </Thead>
              <Tbody>
                {symbolOrder.map((type) => {
                  const config = SYMBOL_CONFIGS[type]!;
                  return (
                    <Tr key={type}>
                      <Td>
                        <Text fontSize="sm" color="white">
                          {SYMBOL_EMOJI[type]} <Text as="span" textTransform="capitalize">{type}</Text>
                        </Text>
                      </Td>
                      {[3, 4, 5].map((count) => (
                        <Td key={count} isNumeric>
                          <Text fontSize="xs" color="yellow.300">
                            {10 * PAYTABLE[count] * config.multiplier}
                          </Text>
                        </Td>
                      ))}
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
              Bet: 10 | 5 paylines
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
}
