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
let logSentOnHiddenOrUnload = false; 

export const logInteraction = (eventType: string, eventData: InteractionData): void => {
  interactionBuffer.push({
    eventType,
    eventData,
    clientTimestamp: new Date().toISOString(),
  });
  // console.log(`[Logger] Buffered: ${eventType}`, JSON.stringify(eventData).substring(0, 100)); // dev: log khi buffer
};

const sendBufferedInteractions = (triggerEvent: string) => {
  console.log(`[Logger] sendBufferedInteractions called by: ${triggerEvent}. Flag_Sent: ${logSentOnHiddenOrUnload}. Buffer: ${interactionBuffer.length}`);

  if (logSentOnHiddenOrUnload || interactionBuffer.length === 0) {
    console.log("[Logger] Skipping send: already sent or buffer empty.");
    return; 
  }

  // Chỉ lấy 100 events cuối để tránh payload quá lớn, có thể điều chỉnh
  const MAX_EVENTS_TO_SEND = 100;
  const eventsToSend = interactionBuffer.length > MAX_EVENTS_TO_SEND 
    ? interactionBuffer.slice(-MAX_EVENTS_TO_SEND) 
    : [...interactionBuffer];

  if (interactionBuffer.length > MAX_EVENTS_TO_SEND) {
    console.warn(`[Logger] Buffer too large (${interactionBuffer.length}), sending last ${MAX_EVENTS_TO_SEND} events.`);
  }


  const payload = {
    interactions: eventsToSend, 
  };

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  
  logSentOnHiddenOrUnload = true; 
  console.log("[Logger] logSentOnHiddenOrUnload SET TO TRUE.");

  const endpoint = `${API_BASE_URL}/api/log-session-interactions`;

  if (navigator.sendBeacon) {
    console.log(`[Logger] Attempting navigator.sendBeacon to: ${endpoint}. Payload size: ${blob.size}`);
    const success = navigator.sendBeacon(endpoint, blob);
    if (success) {
        console.log("[Logger] navigator.sendBeacon queued successfully by " + triggerEvent);
        interactionBuffer = []; 
    } else {
        console.warn(`[Logger] navigator.sendBeacon failed (triggered by ${triggerEvent}). Trying fetch with keepalive.`);
        fetch(endpoint, {
            method: 'POST', body: blob, keepalive: true, headers: {'Content-Type': 'application/json'}
        }).then(() => {
            console.log("[Logger] Fallback fetch (keepalive) succeeded.");
            interactionBuffer = [];
        }).catch((err) => {
            console.error("[Logger] Fallback fetch (keepalive) FAILED:", err);
            logSentOnHiddenOrUnload = false; 
        }); 
    }
  } else {
    console.log(`[Logger] navigator.sendBeacon not available. Attempting fetch with keepalive to: ${endpoint} (triggered by ${triggerEvent}). Payload size: ${blob.size}`);
    fetch(endpoint, {
      method: 'POST', body: blob, keepalive: true, headers: {'Content-Type': 'application/json'}
    }).then(() => {
        console.log("[Logger] Fetch (keepalive) as primary method succeeded.");
        interactionBuffer = [];
    }).catch((err) => {
        console.error("[Logger] Fetch (keepalive) as primary method FAILED:", err);
        logSentOnHiddenOrUnload = false;
    });
  }
};

window.addEventListener('pagehide', (event) => {
       sendBufferedInteractions(`pagehide (persisted: ${event.persisted})`);
});

window.addEventListener('beforeunload', () => {
    sendBufferedInteractions('beforeunload');
    // Không return string ở đây để tránh hiện dialog xác nhận không cần thiết
});

document.addEventListener('visibilitychange', () => {
  // Chỉ gửi khi tab chuyển sang ẩn và chưa gửi lần nào trong phiên unload/hide này
  if (document.visibilityState === 'hidden' && !logSentOnHiddenOrUnload) { 
    console.log("[Logger] 'visibilitychange' to hidden detected, attempting to send logs.");
    sendBufferedInteractions('visibilitychange_hidden');
  }
 
});
