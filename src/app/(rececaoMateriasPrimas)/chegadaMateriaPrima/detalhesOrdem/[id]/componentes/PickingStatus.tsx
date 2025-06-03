import React from 'react';
import { BadgeCheck, BadgeAlert, BadgeX, LucideIcon } from 'lucide-react';
import { PICKING_STATUS_CONFIG } from '../constantsAndTypes/pickingConstants';
import { PickingState } from '../constantsAndTypes/pickingTypes';

interface PickingStatusProps {
  pickState: PickingState;
}

const ICON_MAPPING = {
  BadgeCheck,
  BadgeAlert,
  BadgeX,
} as const;

type IconName = keyof typeof ICON_MAPPING;

const PickingStatus: React.FC<PickingStatusProps> = ({ pickState }) => {
  const getActiveState = (): keyof PickingState | null => {
    return (Object.keys(pickState) as Array<keyof PickingState>)
      .find(key => pickState[key]) || null;
  };

  const activeState = getActiveState();
  const config = activeState ? PICKING_STATUS_CONFIG[activeState] : null;

  // More type-safe way to get the icon component
  const IconComponent: LucideIcon | null = config?.icon 
    ? ICON_MAPPING[config.icon as IconName] || null 
    : null;

  // Don't render anything if no active state
  if (!config || !IconComponent) {
    return (
      <div className="flex rounded-lg border bg-card text-card-foreground shadow-sm min-w-56 min-h-56 justify-center items-center">
        <div className="flex flex-col items-center text-gray-400">
          <p>Aguardando pickagem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex rounded-lg border bg-card text-card-foreground shadow-sm min-w-56 min-h-56 justify-center items-center">
      <div className="flex flex-col items-center">
        <IconComponent 
          size={150} 
          strokeWidth={0.75} 
          color={config.color}
          aria-label={config.message} // Better accessibility
        />
        <p className="mt-2 text-center font-medium">{config.message}</p>
      </div>
    </div>
  );
};

export default PickingStatus;