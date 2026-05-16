export const notificationUtils = {
    // 請求權限
    requestPermission: async (): Promise<boolean> => {
        if (!('Notification' in window)) {
            console.log('此瀏覽器不支援桌面通知');
            return false;
        }

        if (Notification.permission === 'granted') return true;

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    },

    // 發送通知
    send: (title: string, options?: NotificationOptions) => {
        // 如果在 Electron 環境，優先使用原生通知
        if (typeof (window as any).electronAPI !== 'undefined') {
            (window as any).electronAPI.sendNotification({
                title,
                body: options?.body || ''
            });
            return;
        }

        // 網頁版 PWA 通知
        if (Notification.permission === 'granted') {
            // 優先嘗試透過 Service Worker 發送 (PWA 標準)
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, {
                        icon: '/icon-512.png',
                        badge: '/icon-512.png',
                        vibrate: [200, 100, 200],
                        ...options
                    });
                });
            } else {
                // 退而求其次使用普通通知
                new Notification(title, options);
            }
        }
    }
};
