// hooks/useLoteModalFlow.ts
import { useReducer, useCallback } from "react";

// Types for QR scanning
export interface QRLoteData {
  itemCode: string;
  itemName?: string;
  batchNumber: string;
  expiryDate?: string;
  manufacturingDate?: string;
}

export interface QuickLoteData {
  itemCode: string;
  itemName: string;
  lineNum: number;
  batchNumber: string;
  expiryDate?: string;
  manufacturingDate?: string;
}

// Enhanced modal state
export interface LoteModalState {
  // Modal visibility and mode
  isOpen: boolean;
  inputMethod: "manual" | "qr" | "none";

  // Current item being processed
  currentItem: {
    artigo?: string;
    lineNum?: number;
    availableLotes?: any[];
  };

  // QR scanning state
  qrScanState: {
    isScanning: boolean;
    scannedData?: QRLoteData;
    validationResult?: "valid" | "invalid" | "not_found";
    errorMessage?: string;
  };

  // Loading states
  loadingStates: {
    fetchingLotes: boolean;
    validatingQR: boolean;
  };

  // Selection state
  selection: {
    selectedLotes: Array<{
      batchNumber: string;
      itemCode: string;
      quantity: number;
      source: "manual" | "qr";
    }>;
    isValidated: boolean;
  };

  quickModal: {
    isOpen: boolean;
    matchedItem: QuickLoteData | null;
    quantity: number;
    isSubmitting: boolean;
  };
}

type LoteModalAction =
  | { type: "OPEN_MANUAL_MODE"; payload: { artigo: string; lineNum: number } }
  | { type: "OPEN_QR_MODE"; payload: { lineNum: number } }
  | { type: "START_QR_SCAN" }
  | { type: "QR_SCAN_SUCCESS"; payload: QRLoteData }
  | { type: "QR_SCAN_ERROR"; payload: string }
  | {
      type: "QR_VALIDATION_RESULT";
      payload: { result: "valid" | "invalid" | "not_found"; message?: string };
    }
  | { type: "LOTES_FETCH_START" }
  | { type: "LOTES_FETCH_SUCCESS"; payload: any[] }
  | { type: "LOTES_FETCH_ERROR"; payload: string }
  | {
      type: "ADD_LOTE";
      payload: {
        batchNumber: string;
        itemCode: string;
        quantity: number;
        source: "manual" | "qr";
      };
    }
  | {
      type: "UPDATE_LOTE_QUANTITY";
      payload: { batchNumber: string; quantity: number };
    }
  | { type: "REMOVE_LOTE"; payload: string }
  | { type: "VALIDATE_SELECTION" }
  | { type: "RESET_MODAL" }
  | { type: "CLOSE_MODAL" }
  // ADD these new actions
  | { type: "OPEN_QUICK_MODAL"; payload: QuickLoteData }
  | { type: "UPDATE_QUICK_QUANTITY"; payload: number }
  | { type: "SET_QUICK_SUBMITTING"; payload: boolean }
  | { type: "CLOSE_QUICK_MODAL" };

const initialState: LoteModalState = {
  isOpen: false,
  inputMethod: "none",
  currentItem: {},
  qrScanState: {
    isScanning: false,
  },
  loadingStates: {
    fetchingLotes: false,
    validatingQR: false,
  },
  selection: {
    selectedLotes: [],
    isValidated: false,
  },
  quickModal: {
    isOpen: false,
    matchedItem: null,
    quantity: 1,
    isSubmitting: false,
  },
};

function loteModalReducer(
  state: LoteModalState,
  action: LoteModalAction
): LoteModalState {
  switch (action.type) {
    case "OPEN_MANUAL_MODE":
      return {
        ...state,
        isOpen: true,
        inputMethod: "manual",
        currentItem: {
          artigo: action.payload.artigo,
          lineNum: action.payload.lineNum,
        },
        loadingStates: {
          ...state.loadingStates,
          fetchingLotes: true,
        },
        // Reset previous state
        qrScanState: { isScanning: false },
        selection: { selectedLotes: [], isValidated: false },
      };

    case "OPEN_QR_MODE":
      return {
        ...state,
        isOpen: true,
        inputMethod: "qr",
        currentItem: {
          lineNum: action.payload.lineNum,
        },
        qrScanState: {
          isScanning: true,
        },
        // Reset previous state
        selection: { selectedLotes: [], isValidated: false },
      };

    case "START_QR_SCAN":
      return {
        ...state,
        qrScanState: {
          ...state.qrScanState,
          isScanning: true,
          errorMessage: undefined,
        },
      };

    case "QR_SCAN_SUCCESS":
      return {
        ...state,
        qrScanState: {
          ...state.qrScanState,
          isScanning: false,
          scannedData: action.payload,
        },
        loadingStates: {
          ...state.loadingStates,
          validatingQR: true,
        },
      };

    case "QR_SCAN_ERROR":
      return {
        ...state,
        qrScanState: {
          ...state.qrScanState,
          isScanning: false,
          errorMessage: action.payload,
        },
      };

    case "QR_VALIDATION_RESULT":
      return {
        ...state,
        qrScanState: {
          ...state.qrScanState,
          validationResult: action.payload.result,
          errorMessage: action.payload.message,
        },
        loadingStates: {
          ...state.loadingStates,
          validatingQR: false,
        },
        // If valid, auto-add the lote from QR
        selection:
          action.payload.result === "valid" && state.qrScanState.scannedData
            ? {
                ...state.selection,
                selectedLotes: [
                  ...state.selection.selectedLotes,
                  {
                    batchNumber: state.qrScanState.scannedData.batchNumber,
                    itemCode: state.qrScanState.scannedData.itemCode,
                    quantity: 0, // User needs to input this
                    source: "qr" as const,
                  },
                ],
              }
            : state.selection,
      };

    case "LOTES_FETCH_SUCCESS":
      return {
        ...state,
        currentItem: {
          ...state.currentItem,
          availableLotes: action.payload,
        },
        loadingStates: {
          ...state.loadingStates,
          fetchingLotes: false,
        },
      };

    case "ADD_LOTE":
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedLotes: [
            ...state.selection.selectedLotes.filter(
              (lote) => lote.batchNumber !== action.payload.batchNumber
            ),
            action.payload,
          ],
        },
      };

    case "UPDATE_LOTE_QUANTITY":
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedLotes: state.selection.selectedLotes.map((lote) =>
            lote.batchNumber === action.payload.batchNumber
              ? { ...lote, quantity: action.payload.quantity }
              : lote
          ),
        },
      };

    case "REMOVE_LOTE":
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedLotes: state.selection.selectedLotes.filter(
            (lote) => lote.batchNumber !== action.payload
          ),
        },
      };

    case "VALIDATE_SELECTION":
      return {
        ...state,
        selection: {
          ...state.selection,
          isValidated: true,
        },
      };

    case "RESET_MODAL":
      return initialState;

    case "CLOSE_MODAL":
      return {
        ...initialState,
        isOpen: false,
      };

    case "OPEN_QUICK_MODAL":
      return {
        ...state,
        // Close any existing modals
        isOpen: false,
        inputMethod: "none",
        qrScanState: { isScanning: false },
        // Open quick modal
        quickModal: {
          isOpen: true,
          matchedItem: action.payload,
          quantity: 1, // Default quantity
          isSubmitting: false,
        },
      };

    case "UPDATE_QUICK_QUANTITY":
      return {
        ...state,
        quickModal: {
          ...state.quickModal,
          quantity: action.payload,
        },
      };

    case "SET_QUICK_SUBMITTING":
      return {
        ...state,
        quickModal: {
          ...state.quickModal,
          isSubmitting: action.payload,
        },
      };

    case "CLOSE_QUICK_MODAL":
      return {
        ...state,
        quickModal: {
          isOpen: false,
          matchedItem: null,
          quantity: 1,
          isSubmitting: false,
        },
      };

    default:
      return state;
  }
}

export const useLoteModalFlow = () => {
  const [state, dispatch] = useReducer(loteModalReducer, initialState);

  // Action creators
  const openManualMode = useCallback((artigo: string, lineNum: number) => {
    dispatch({ type: "OPEN_MANUAL_MODE", payload: { artigo, lineNum } });
  }, []);

  const openQRMode = useCallback((lineNum: number) => {
    dispatch({ type: "OPEN_QR_MODE", payload: { lineNum } });
  }, []);

  const startQRScan = useCallback(() => {
    dispatch({ type: "START_QR_SCAN" });
  }, []);

  const handleQRScanSuccess = useCallback((qrData: QRLoteData) => {
    dispatch({ type: "QR_SCAN_SUCCESS", payload: qrData });
  }, []);

  const handleQRScanError = useCallback((error: string) => {
    dispatch({ type: "QR_SCAN_ERROR", payload: error });
  }, []);

  const validateQRAgainstOrder = useCallback(
    (orderItems: any[]) => {
      if (!state.qrScanState.scannedData) return;

      const { itemCode, itemName } = state.qrScanState.scannedData;

      // Check if item exists in current order
      const itemExists = orderItems.some(
        (item) =>
          item.ItemCode === itemCode ||
          (itemName && item.ItemDescription === itemName)
      );

      if (itemExists) {
        dispatch({
          type: "QR_VALIDATION_RESULT",
          payload: { result: "valid" },
        });
      } else {
        dispatch({
          type: "QR_VALIDATION_RESULT",
          payload: {
            result: "not_found",
            message: `Item ${itemCode} não encontrado na ordem atual`,
          },
        });
      }
    },
    [state.qrScanState.scannedData]
  );

  const handleLotesFetchSuccess = useCallback((lotes: any[]) => {
    dispatch({ type: "LOTES_FETCH_SUCCESS", payload: lotes });
  }, []);

  const addLote = useCallback(
    (
      batchNumber: string,
      itemCode: string,
      quantity: number,
      source: "manual" | "qr" = "manual"
    ) => {
      dispatch({
        type: "ADD_LOTE",
        payload: { batchNumber, itemCode, quantity, source },
      });
    },
    []
  );

  const updateLoteQuantity = useCallback(
    (batchNumber: string, quantity: number) => {
      dispatch({
        type: "UPDATE_LOTE_QUANTITY",
        payload: { batchNumber, quantity },
      });
    },
    []
  );

  const removeLote = useCallback((batchNumber: string) => {
    dispatch({ type: "REMOVE_LOTE", payload: batchNumber });
  }, []);

  const validateSelection = useCallback(() => {
    dispatch({ type: "VALIDATE_SELECTION" });
  }, []);

  const resetModal = useCallback(() => {
    dispatch({ type: "RESET_MODAL" });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: "CLOSE_MODAL" });
  }, []);
  const openQuickModal = useCallback((matchedItem: QuickLoteData) => {
    dispatch({ type: "OPEN_QUICK_MODAL", payload: matchedItem });
  }, []);

  const updateQuickQuantity = useCallback((quantity: number) => {
    dispatch({ type: "UPDATE_QUICK_QUANTITY", payload: quantity });
  }, []);

  const setQuickSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: "SET_QUICK_SUBMITTING", payload: isSubmitting });
  }, []);

  const closeQuickModal = useCallback(() => {
    dispatch({ type: "CLOSE_QUICK_MODAL" });
  }, []);

  // Computed values
  const canValidate =
    state.selection.selectedLotes.length > 0 &&
    state.selection.selectedLotes.every((lote) => lote.quantity > 0);

  const isReadyForQuantityInput =
    state.inputMethod === "qr" &&
    state.qrScanState.validationResult === "valid";

  const hasValidQRScan =
    state.qrScanState.scannedData &&
    state.qrScanState.validationResult === "valid";

  return {
    state,
    actions: {
      openManualMode,
      openQRMode,
      startQRScan,
      handleQRScanSuccess,
      handleQRScanError,
      validateQRAgainstOrder,
      handleLotesFetchSuccess,
      addLote,
      updateLoteQuantity,
      removeLote,
      validateSelection,
      resetModal,
      closeModal,
      // ADD these new actions:
      openQuickModal,
      updateQuickQuantity,
      setQuickSubmitting,
      closeQuickModal,
    },
    computed: {
      canValidate,
      isReadyForQuantityInput,
      hasValidQRScan,
      isLoading:
        state.loadingStates.fetchingLotes || state.loadingStates.validatingQR,
      showManualSelection:
        state.inputMethod === "manual" && !state.loadingStates.fetchingLotes,
      showQRInterface: state.inputMethod === "qr",
      showQuantityInput: state.selection.selectedLotes.length > 0,
    },
  };
};
