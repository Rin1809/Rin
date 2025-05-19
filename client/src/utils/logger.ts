// client/src/utils/logger.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface InteractionData {
  [key: string]: any;
}

interface BufferedLogEntry {
  eventType: string;
  eventData: InteractionData;
  clientTimestamp: string; // ts client cho moi event
}

let interactionBuffer: BufferedLogEntry[] = [];
let beaconSentOnUnload = false; // dam bao gui 1 lan khi unload

export const logInteraction = (eventType: string, eventData: InteractionData): void => {
  interactionBuffer.push({
    eventType,
    eventData,
    clientTimestamp: new Date().toISOString(),
  });
  // console.log(`[Logger] Buffered: ${eventType}`, JSON.stringify(eventData).substring(0, 100)); // dev
};

const sendBufferedInteractions = () => {
  if (beaconSentOnUnload || interactionBuffer.length === 0) {
    return; // da gui hoac buffer rong
  }

  const payload = {
    interactions: [...interactionBuffer], 
  };

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  
  beaconSentOnUnload = true; // danh dau da co gang gui
  
  if (navigator.sendBeacon) {
    const success = navigator.sendBeacon(`${API_BASE_URL}/api/log-session-interactions`, blob);
    if (success) {
        interactionBuffer = []; 
    } else {
        // console.warn("[Logger] sendBeacon that bai, thu fetch voi keepalive."); // dev
        fetch(`${API_BASE_URL}/api/log-session-interactions`, {
            method: 'POST', body: blob, keepalive: true, headers: {'Content-Type': 'application/json'}
        }).then(() => interactionBuffer = []).catch(() => beaconSentOnUnload = false); // reset neu fetch loi
    }
  } else {
    fetch(`${API_BASE_URL}/api/log-session-interactions`, {
      method: 'POST', body: blob, keepalive: true, headers: {'Content-Type': 'application/json'}
    }).then(() => interactionBuffer = []).catch(() => beaconSentOnUnload = false);
  }
};

window.addEventListener('pagehide', sendBufferedInteractions);
window.addEventListener('beforeunload', sendBufferedInteractions);