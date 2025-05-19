// client/src/utils/logger.ts
// tien ich gui log

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface InteractionData {
  [key: string]: any;
}

interface BufferedLogEntry {
  eventType: string;
  eventData: InteractionData;
  clientTimestamp: string; // them ts cho moi event
}

let interactionBuffer: BufferedLogEntry[] = [];
const SESSION_STORAGE_KEY = 'rin_interaction_log_buffer';

// Load buffer tu ssStorage khi script load
try {
    const storedBuffer = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedBuffer) {
        interactionBuffer = JSON.parse(storedBuffer);
    }
} catch (e) {
    console.error("[Logger] Loi load buffer ssStorage:", e);
    interactionBuffer = []; // reset neu loi
}

// Luu buffer vao ssStorage
const saveBufferToSessionStorage = () => {
    try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(interactionBuffer));
    } catch (e) {
        console.error("[Logger] Loi luu buffer ssStorage:", e);
    }
};

export const logInteraction = (eventType: string, eventData: InteractionData): void => {
  const payload: BufferedLogEntry = {
    eventType,
    eventData,
    clientTimestamp: new Date().toISOString(),
  };
  interactionBuffer.push(payload);
  saveBufferToSessionStorage(); // luu sau moi lan them
  // console.log(`[Logger] Buffered: ${eventType}`, eventData); 
};

const sendBufferedLogs = () => {
  if (interactionBuffer.length === 0) {
    return;
  }

  const payloadToSend = {
    bufferedLogs: [...interactionBuffer], // copy de tranh race
    sessionEndTime: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(payloadToSend)], { type: 'application/json; charset=UTF-8' });
  
  // dung sendBeacon dam bao gui dc truoc khi unload
  // console.log('[Logger] Gui log buffer (sendBeacon):', payloadToSend); 
  if (navigator.sendBeacon) { // Ktra sendBeacon co ton tai ko
    navigator.sendBeacon(`${API_BASE_URL}/api/log-session-interactions`, blob);
  } else { // Fallback neu ko co sendBeacon (hiem)
    fetch(`${API_BASE_URL}/api/log-session-interactions`, {
        method: 'POST',
        body: blob,
        keepalive: true // Cần thiết cho fetch khi unload
    }).catch(err => console.error("[Logger] Loi fallback fetch:", err));
  }

  interactionBuffer = []; // xoa buffer sau khi gui
  sessionStorage.removeItem(SESSION_STORAGE_KEY); // xoa khoi ssStorage
};

// Gui log khi user roi trang
window.addEventListener('beforeunload', sendBufferedLogs);

