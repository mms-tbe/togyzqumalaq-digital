"use client";

import { Group, ActionIcon, Slider, Text } from "@mantine/core";
import {
  IconPlayerSkipBack,
  IconPlayerTrackPrev,
  IconPlayerTrackNext,
  IconPlayerSkipForward,
} from "@tabler/icons-react";

interface BoardControlsProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
}

export function BoardControls({
  currentStep,
  totalSteps,
  onStepChange,
}: BoardControlsProps) {
  return (
    <div>
      <Group justify="center" mb="xs">
        <ActionIcon
          variant="default"
          onClick={() => onStepChange(0)}
          disabled={currentStep === 0}
        >
          <IconPlayerSkipBack size={16} />
        </ActionIcon>
        <ActionIcon
          variant="default"
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <IconPlayerTrackPrev size={16} />
        </ActionIcon>
        <Text size="sm" w={80} style={{ textAlign: "center" }}>
          {currentStep} / {totalSteps}
        </Text>
        <ActionIcon
          variant="default"
          onClick={() => onStepChange(Math.min(totalSteps, currentStep + 1))}
          disabled={currentStep === totalSteps}
        >
          <IconPlayerTrackNext size={16} />
        </ActionIcon>
        <ActionIcon
          variant="default"
          onClick={() => onStepChange(totalSteps)}
          disabled={currentStep === totalSteps}
        >
          <IconPlayerSkipForward size={16} />
        </ActionIcon>
      </Group>
      {totalSteps > 0 && (
        <Slider
          value={currentStep}
          onChange={onStepChange}
          min={0}
          max={totalSteps}
          step={1}
          label={(v) => `Ход ${v}`}
        />
      )}
    </div>
  );
}
