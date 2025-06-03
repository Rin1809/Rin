// client/src/utils/logger.ts

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
    // Luon goi API tuong doi /api/*
    fetch(`/api/log-interaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    .then(response => {
      if (!response.ok) {
        // console.warn(`[Logger] Loi gui log '${eventType}': ${response.status}`);
      } else {
        // console.log(`[Logger] Logged: ${eventType}`, eventData);
      }
    })
    .catch(error => {
      console.error(`[Logger] Loi fetch khi gui log '${eventType}':`, error);
    });
  } catch (error) {
    console.error(`[Logger] Loi dong bo khi gui log '${eventType}':`, error);
  }
};