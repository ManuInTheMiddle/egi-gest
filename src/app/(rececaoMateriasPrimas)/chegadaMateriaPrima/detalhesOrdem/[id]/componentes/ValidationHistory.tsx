import React from 'react';
import { CheckCircle } from 'lucide-react';
import { ValidatedItem } from '../constantsAndTypes/pickingTypes';

interface ValidationHistoryProps {
  validatedItems: ValidatedItem[];
}

const ValidationHistory: React.FC<ValidationHistoryProps> = ({ 
  validatedItems 
}) => {
  const validItems = validatedItems.filter(item => item.ItemCode !== "");

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 mb-2">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Histórico Ordem
      </h3>
      
      <ol className="relative ms-3 border-s border-gray-200 dark:border-gray-700">
        {validItems.map((item, index) => (
          <li
            className="ms-6 py-2 text-primary-700 dark:text-primary-500"
            key={`${item.ItemCode}-${item.baseLine}-${index}`}
          >
            <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white dark:bg-primary-900 dark:ring-gray-800">
              <CheckCircle color="#84CC27" />
            </span>
            <div>
              <h4 className="mb-0.5 font-semibold">
                {item.timestamp}
              </h4>
              <a className="text-sm font-medium">
                Item pickado - ID do Produto {item.ItemCode}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ValidationHistory;