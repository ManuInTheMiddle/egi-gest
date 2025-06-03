import { useCallback } from 'react';
import useWebSocket from "react-use-websocket";
import { WEBSOCKET_URL } from '../constantsAndTypes/pickingConstants';
import { QRData } from '../constantsAndTypes/pickingTypes';

interface WebSocketMessage {
  type: string;
  payload?: {
    parsed?: QRData;
    [key: string]: any;
  };
}

interface UseQRScanningProps {
  onQRData: (qrData: QRData) => void;
}

interface UseQRScanningReturn {
  lastMessage: MessageEvent<any> | null;
}

const isJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

export const useQRScanning = ({ onQRData }: UseQRScanningProps): UseQRScanningReturn => {
  const { lastMessage } = useWebSocket(WEBSOCKET_URL, {
    onOpen: (event: Event) => {
      console.log("WebSocket opened", event);
    },
    onMessage: useCallback((event: MessageEvent) => {
      console.log("Message received", event.data);
      
      if (!isJSON(event.data)) return;
      
      const dataPARSEADA: WebSocketMessage = JSON.parse(event.data);
      
      if (dataPARSEADA.type === "qr_data" && dataPARSEADA.payload?.parsed) {
        onQRData(dataPARSEADA.payload.parsed);
      } else if (dataPARSEADA.type === "status") {
        console.log("Status update:", dataPARSEADA.payload);
      }
    }, [onQRData]),
    share: true,
  });

  return { lastMessage };
};