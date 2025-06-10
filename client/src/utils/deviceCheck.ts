// client/src/utils/deviceCheck.ts

// Ktr thiet bi co phai mobile/tablet thuc su hay k, k phu thuoc vao size window
export const isMobileOrTablet = (): boolean => {
    if (typeof navigator === 'undefined') {
        return false;
    }
    
    // Ktr qua user agent string
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
};