"use client";

import { Paper, Text, Group, Stack, Badge, SimpleGrid } from "@mantine/core";
import { type BoardState, TUZ_MARKER } from "@/lib/engine/types";

interface TogyzBoardProps {
  board: BoardState;
  onPitClick?: (pit: number) => void;
  interactive?: boolean;
}

function Pit({
  value,
  label,
  isTuz,
  isActive,
  onClick,
}: {
  value: number;
  label: number;
  isTuz: boolean;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Paper
      shadow={isActive ? "md" : "xs"}
      p="xs"
      withBorder
      style={{
        textAlign: "center",
        cursor: isActive ? "pointer" : "default",
        backgroundColor: isTuz ? "var(--mantine-color-red-1)" : undefined,
        borderColor: isActive ? "var(--mantine-color-indigo-5)" : undefined,
        minWidth: 50,
      }}
      onClick={isActive ? onClick : undefined}
    >
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={700} size="lg">
        {isTuz ? "X" : value}
      </Text>
    </Paper>
  );
}

function Kazan({ value, label }: { value: number; label: string }) {
  return (
    <Paper
      shadow="sm"
      p="md"
      withBorder
      style={{
        textAlign: "center",
        minWidth: 70,
        backgroundColor: "var(--mantine-color-indigo-0)",
      }}
    >
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={700} size="xl">
        {value}
      </Text>
    </Paper>
  );
}

export function TogyzBoard({ board, onPitClick, interactive }: TogyzBoardProps) {
  const isWhiteTurn = board.side === "white";

  return (
    <Stack gap="xs">
      <Group justify="space-between" mb="xs">
        <Badge color={!isWhiteTurn ? "indigo" : "gray"} variant="filled">
          Чёрные (Қостаушы)
        </Badge>
        <Text size="sm" c="dimmed">
          Ход: {board.moveNumber}
        </Text>
      </Group>

      <Group gap="xs" justify="center" wrap="nowrap">
        <Kazan value={board.kazans[1]} label="Казан" />
        <SimpleGrid cols={9} spacing="xs">
          {/* Black pits: displayed 9 to 1 (right to left) */}
          {Array.from({ length: 9 }, (_, i) => 17 - i).map((idx) => (
            <Pit
              key={`b-${idx}`}
              value={board.pits[idx]}
              label={idx - 8}
              isTuz={board.pits[idx] === TUZ_MARKER}
              isActive={interactive === true && !isWhiteTurn}
              onClick={() => onPitClick?.(idx - 8)}
            />
          ))}
          {/* White pits: displayed 1 to 9 (left to right) */}
          {Array.from({ length: 9 }, (_, i) => i).map((idx) => (
            <Pit
              key={`w-${idx}`}
              value={board.pits[idx]}
              label={idx + 1}
              isTuz={board.pits[idx] === TUZ_MARKER}
              isActive={interactive === true && isWhiteTurn}
              onClick={() => onPitClick?.(idx + 1)}
            />
          ))}
        </SimpleGrid>
        <Kazan value={board.kazans[0]} label="Казан" />
      </Group>

      <Group justify="space-between" mt="xs">
        <Badge color={isWhiteTurn ? "indigo" : "gray"} variant="filled">
          Белые (Бастаушы)
        </Badge>
        <Text size="sm" c="dimmed">
          {board.kazans[0]} : {board.kazans[1]}
        </Text>
      </Group>
    </Stack>
  );
}
