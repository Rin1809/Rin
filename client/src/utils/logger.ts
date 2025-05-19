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
let logSentOnUnload = false; 

export const logInteraction = (eventType: string, eventData: InteractionData): void => {
  interactionBuffer.push({
    eventType,
    eventData,
    clientTimestamp: new Date().toISOString(),
  });
  // console.log(`[Logger] Buffered: ${eventType}`, JSON.stringify(eventData).substring(0, 100)); // dev: log khi buffer
};

const sendBufferedInteractions = (triggerEvent: string) => { // triggerEvent duoc truyen vao
  console.log(`[Logger] sendBufferedInteractions called by: ${triggerEvent}. Flag_Sent: ${logSentOnUnload}. Buffer: ${interactionBuffer.length}`);

  if (logSentOnUnload || interactionBuffer.length === 0) {
    console.log(`[Logger] Skipping send (triggered by ${triggerEvent}): already sent or buffer empty.`); // Them triggerEvent vao log
    return; 
  }

  const MAX_EVENTS_TO_SEND = 100; 
  const eventsToSend = interactionBuffer.length > MAX_EVENTS_TO_SEND 
    ? interactionBuffer.slice(-MAX_EVENTS_TO_SEND) 
    : [...interactionBuffer];

  if (interactionBuffer.length > MAX_EVENTS_TO_SEND) {
    console.warn(`[Logger] Buffer too large (${interactionBuffer.length}), sending last ${MAX_EVENTS_TO_SEND} events (triggered by ${triggerEvent}).`); // Them triggerEvent vao log
  }

  const payload = {
    interactions: eventsToSend, 
  };

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  
  logSentOnUnload = true; 
  console.log(`[Logger] logSentOnUnload SET TO TRUE (triggered by ${triggerEvent}).`); // Them triggerEvent vao log

  const endpoint = `${API_BASE_URL}/api/log-session-interactions`;

  if (navigator.sendBeacon) {
    console.log(`[Logger] Attempting navigator.sendBeacon to: ${endpoint} (triggered by ${triggerEvent}). Payload size: ${blob.size}`); // Them triggerEvent vao log
    const success = navigator.sendBeacon(endpoint, blob);
    if (success) {
        console.log(`[Logger] navigator.sendBeacon queued successfully by ${triggerEvent}.`);
        interactionBuffer = []; 
    } else {
        console.warn(`[Logger] navigator.sendBeacon failed (triggered by ${triggerEvent}). Trying fetch with keepalive.`); // Them triggerEvent vao log
        fetch(endpoint, {
            method: 'POST', body: blob, keepalive: true, headers: {'Content-Type': 'application/json'}
        }).then(() => {
            console.log(`[Logger] Fallback fetch (keepalive) succeeded (triggered by ${triggerEvent}).`); // Them triggerEvent vao log
            interactionBuffer = [];
        }).catch((err) => {
            console.error(`[Logger] Fallback fetch (keepalive) FAILED (triggered by ${triggerEvent}):`, err); // Them triggerEvent vao log
            logSentOnUnload = false; 
        }); 
    }
  } else {
    console.log(`[Logger] navigator.sendBeacon not available. Attempting fetch with keepalive to: ${endpoint} (triggered by ${triggerEvent}). Payload size: ${blob.size}`); // Them triggerEvent vao log
    fetch(endpoint, {
      method: 'POST', body: blob, keepalive: true, headers: {'Content-Type': 'application/json'}
    }).then(() => {
        console.log(`[Logger] Fetch (keepalive) as primary method succeeded (triggered by ${triggerEvent}).`); // Them triggerEvent vao log
        interactionBuffer = [];
    }).catch((err) => {
        console.error(`[Logger] Fetch (keepalive) as primary method FAILED (triggered by ${triggerEvent}):`, err); // Them triggerEvent vao log
        logSentOnUnload = false;
    });
  }
};

window.addEventListener('pagehide', (event) => {
    sendBufferedInteractions(`pagehide (persisted: ${event.persisted})`);
});

window.addEventListener('beforeunload', () => {
    sendBufferedInteractions('beforeunload');
});

/* 
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && !logSentOnUnload) { 
    sendBufferedInteractions('visibilitychange_hidden');
  }
});
*/