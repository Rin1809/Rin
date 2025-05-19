// client/src/utils/logger.ts
// tien ich gui log

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface InteractionData {
  [key: string]: any; 
}

export const logInteraction = async (eventType: string, eventData: InteractionData): Promise<void> => {
  const payload = {
    eventType,
    eventData,
    timestamp: new Date().toISOString(),
  };

  try {
    // Gui async, ko block UI
    fetch(`${API_BASE_URL}/api/log-interaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    .then(response => {
      if (!response.ok) {
        // console.warn(`[Logger] Loi gui log '${eventType}': ${response.status}`); // comment out khi deploy
      } else {
        // console.log(`[Logger] Logged: ${eventType}`, eventData); // comment out khi deploy
      }
    })
    .catch(error => {
      console.error(`[Logger] Loi fetch khi gui log '${eventType}':`, error);
    });
  } catch (error) {
    console.error(`[Logger] Loi dong bo khi gui log '${eventType}':`, error);
  }
};