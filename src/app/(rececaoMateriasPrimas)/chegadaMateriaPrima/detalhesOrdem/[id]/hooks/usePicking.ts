// src/hooks/usePicking.ts
import { useState, useCallback } from 'react';
import { PICKING_STATES, PickingStateType } from '../constantsAndTypes/pickingConstants';
import { PickingState, ItemToValidate, ValidatedItem } from '../constantsAndTypes/pickingTypes';

interface UsePickingProps {
  itensAValidar: ItemToValidate[];
  itensValidados: ValidatedItem[];
}

interface UsePickingReturn {
  pickState: PickingState;
  handlePickagem: (codigoMateriaPrima: string) => PickingStateType;
  resetPickState: () => void;
  setPickState: (state: PickingState) => void;
}

/**
 * Custom hook for handling picking logic and validation
 * 
 * This hook manages:
 * - QR code validation against available items
 * - Checking if items were already picked
 * - Managing picking state (success, alert, error)
 * 
 * @param itensAValidar - Array of items available for picking
 * @param itensValidados - Array of items already validated/picked
 * @returns Object with picking state and handlers
 */
export const usePicking = ({ 
  itensAValidar, 
  itensValidados 
}: UsePickingProps): UsePickingReturn => {
  const [pickState, setPickState] = useState<PickingState>({
    success: false,
    alert: false,
    error: false,
  });

  /**
   * Main picking logic handler
   * 
   * Business rules:
   * 1. If item exists in order AND not yet validated → SUCCESS
   * 2. If item exists in order BUT already validated → ALERT (duplicate)
   * 3. If item doesn't exist in order → ERROR (wrong item)
   */
  const handlePickagem = useCallback((codigoMateriaPrima: string): PickingStateType => {
    console.log('🔍 Processing picking for code:', codigoMateriaPrima);
    console.log('📋 Items to validate:', itensAValidar.length);
    console.log('✅ Items already validated:', itensValidados.filter(item => item.ItemCode !== "").length);

    // Check if the scanned item exists in the purchase order
    const itemExists = itensAValidar.some(item => 
      item.LineNum === Number(codigoMateriaPrima)
    );

    // Check if this item was already validated/picked
    const isAlreadyValidated = itensValidados.some(item => 
      item.baseLine === Number(codigoMateriaPrima) && item.ItemCode !== ""
    );

    console.log('📦 Item exists in order:', itemExists);
    console.log('🔄 Already validated:', isAlreadyValidated);

    // CASE 1: Valid item, not yet picked - SUCCESS
    if (itemExists && !isAlreadyValidated) {
      console.log('✅ SUCCESS: Item valid and ready for picking');
      setPickState({ success: true, alert: false, error: false });
      return PICKING_STATES.SUCCESS;
    } 
    
    // CASE 2: Valid item, but already picked - ALERT
    else if (itemExists && isAlreadyValidated) {
      console.log('⚠️ ALERT: Item already picked');
      setPickState({ success: false, alert: true, error: false });
      return PICKING_STATES.ALERT;
    } 
    
    // CASE 3: Item doesn't exist in this order - ERROR
    else {
      console.log('❌ ERROR: Item not found in this order');
      setPickState({ success: false, alert: false, error: true });
      return PICKING_STATES.ERROR;
    }
  }, [itensAValidar, itensValidados]);

  /**
   * Reset picking state to initial/idle state
   */
  const resetPickState = useCallback((): void => {
    console.log('🔄 Resetting pick state');
    setPickState({ success: false, alert: false, error: false });
  }, []);

  return { 
    pickState, 
    handlePickagem, 
    resetPickState,
    setPickState
  };
};

// Example usage in component:
/*
const ExampleComponent = () => {
  const [itensAValidar] = useState([
    { LineNum: 1, ItemCode: "MP001", ItemDescription: "Material 1" },
    { LineNum: 2, ItemCode: "MP002", ItemDescription: "Material 2" },
  ]);

  const [itensValidados] = useState([
    { ItemCode: "MP001", baseLine: 1, quantidade: 10, timestamp: "..." }
  ]);

  const { pickState, handlePickagem, resetPickState } = usePicking({
    itensAValidar,
    itensValidados
  });

  // When QR code is scanned:
  const onQRScan = (qrData) => {
    if (qrData.F === "MateriaPrima") {
      const result = handlePickagem(qrData.C1); // C1 contains the LineNum
      
      switch(result) {
        case 'success':
          // Add item to validated list
          break;
        case 'alert':
          // Show "already picked" message
          break;
        case 'error':
          // Show "item not found" message
          break;
      }
    }
  };

  return (
    <div>
      {pickState.success && <SuccessMessage />}
      {pickState.alert && <AlertMessage />}
      {pickState.error && <ErrorMessage />}
    </div>
  );
};
*/

// Alternative implementation using Union Types (cleaner approach):
export type PickingStateUnion = 'idle' | 'success' | 'alert' | 'error';

interface UsePickingUnionProps {
  itensAValidar: ItemToValidate[];
  itensValidados: ValidatedItem[];
}

interface UsePickingUnionReturn {
  pickState: PickingStateUnion;
  handlePickagem: (codigoMateriaPrima: string) => PickingStateUnion;
  resetPickState: () => void;
  setPickState: (state: PickingStateUnion) => void;
}

/**
 * Alternative implementation using union types (recommended)
 * This approach prevents impossible states and is easier to reason about
 */
export const usePickingUnion = ({ 
  itensAValidar, 
  itensValidados 
}: UsePickingUnionProps): UsePickingUnionReturn => {
  const [pickState, setPickState] = useState<PickingStateUnion>('idle');

  const handlePickagem = useCallback((codigoMateriaPrima: string): PickingStateUnion => {
    const itemExists = itensAValidar.some(item => 
      item.LineNum === Number(codigoMateriaPrima)
    );

    const isAlreadyValidated = itensValidados.some(item => 
      item.baseLine === Number(codigoMateriaPrima) && item.ItemCode !== ""
    );

    let newState: PickingStateUnion;

    if (itemExists && !isAlreadyValidated) {
      newState = 'success';
    } else if (itemExists && isAlreadyValidated) {
      newState = 'alert';
    } else {
      newState = 'error';
    }

    setPickState(newState);
    return newState;
  }, [itensAValidar, itensValidados]);

  const resetPickState = useCallback((): void => {
    setPickState('idle');
  }, []);

  return { 
    pickState, 
    handlePickagem, 
    resetPickState,
    setPickState
  };
};

// Helper functions for debugging and testing
export const usePickingDebug = (hookResult: UsePickingReturn) => {
  const { pickState, handlePickagem } = hookResult;

  const debugInfo = {
    currentState: pickState,
    isIdle: !pickState.success && !pickState.alert && !pickState.error,
    isSuccess: pickState.success,
    isAlert: pickState.alert,
    isError: pickState.error,
  };

  const testPicking = (testCases: Array<{ code: string; expected: PickingStateType }>) => {
    console.log('🧪 Running picking tests...');
    testCases.forEach(({ code, expected }) => {
      const result = handlePickagem(code);
      const passed = result === expected;
      console.log(`${passed ? '✅' : '❌'} Code: ${code}, Expected: ${expected}, Got: ${result}`);
    });
  };

  return { debugInfo, testPicking };
};

export default usePicking;