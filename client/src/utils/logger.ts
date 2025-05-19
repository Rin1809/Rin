// client/src/utils/logger.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface InteractionData {
  [key: string]: any;
}

interface BufferedLogEntry {
  eventType: string;
  eventData: InteractionData;
  clientTimestamp: string; 
}

let interactionBuffer: BufferedLogEntry[] = [];
let beaconSentOnUnload = false; 

export const logInteraction = (eventType: string, eventData: InteractionData): void => {
  interactionBuffer.push({
    eventType,
    eventData,
    clientTimestamp: new Date().toISOString(),
  });
  console.log(`[Logger] Buffered: ${eventType}`, JSON.stringify(eventData).substring(0, 100)); // Log khi buffer
};

const sendBufferedInteractions = () => {
  console.log("[Logger] sendBufferedInteractions called. Beacon sent flag:", beaconSentOnUnload, "Buffer length:", interactionBuffer.length);

  if (beaconSentOnUnload || interactionBuffer.length === 0) {
    console.log("[Logger] Skipping send: already sent or buffer empty.");
    return; 
  }

  const payload = {
    interactions: [...interactionBuffer], 
  };

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  
  beaconSentOnUnload = true; 
  console.log("[Logger] beaconSentOnUnload SET TO TRUE.");


  if (navigator.sendBeacon) {
    console.log("[Logger] Attempting navigator.sendBeacon to:", `${API_BASE_URL}/api/log-session-interactions`, "Payload size:", blob.size);
    const success = navigator.sendBeacon(`${API_BASE_URL}/api/log-session-interactions`, blob);
    if (success) {
        console.log("[Logger] navigator.sendBeacon call returned true (queued).");
        interactionBuffer = []; 
    } else {
        console.warn("[Logger] navigator.sendBeacon call returned false. Trying fetch with keepalive.");
        fetch(`${API_BASE_URL}/api/log-session-interactions`, {
            method: 'POST', body: blob, keepalive: true, headers: {'Content-Type': 'application/json'}
        }).then(() => {
            console.log("[Logger] Fallback fetch (keepalive) succeeded.");
            interactionBuffer = [];
        }).catch((err) => {
            console.error("[Logger] Fallback fetch (keepalive) FAILED:", err);
            beaconSentOnUnload = false; // Reset de co the thu lai
        }); 
    }
  } else {
    console.log("[Logger] navigator.sendBeacon not available. Attempting fetch with keepalive to:", `${API_BASE_URL}/api/log-session-interactions`, "Payload size:", blob.size);
    fetch(`${API_BASE_URL}/api/log-session-interactions`, {
      method: 'POST', body: blob, keepalive: true, headers: {'Content-Type': 'application/json'}
    }).then(() => {
        console.log("[Logger] Fetch (keepalive) as primary method succeeded.");
        interactionBuffer = [];
    }).catch((err) => {
        console.error("[Logger] Fetch (keepalive) as primary method FAILED:", err);
        beaconSentOnUnload = false;
    });
  }
};

window.addEventListener('pagehide', (event) => {
    console.log("[Logger] 'pagehide' event triggered. Persisted:", event.persisted);
    sendBufferedInteractions();
});
window.addEventListener('beforeunload', () => {
    console.log("[Logger] 'beforeunload' event triggered.");
    sendBufferedInteractions();
    
});

