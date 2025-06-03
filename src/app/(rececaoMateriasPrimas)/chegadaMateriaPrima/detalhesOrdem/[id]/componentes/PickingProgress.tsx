import React from 'react';
import { Progress } from "@/components/ui/progress";

interface PickingProgressProps {
  itemsToPick: number;
  totalItems: number;
}

const PickingProgress: React.FC<PickingProgressProps> = ({ 
  itemsToPick, 
  totalItems 
}) => {
  const progressValue = totalItems ? ((totalItems - itemsToPick) * 100) / totalItems : 0;
  
  return (
    <div>
      <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
        <span className="font-medium text-gray-900 dark:text-white">
          Itens por Pickar:
        </span>{" "}
        {itemsToPick}
      </p>
      <Progress value={progressValue} />
    </div>
  );
};

export default PickingProgress;