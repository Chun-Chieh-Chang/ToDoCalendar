export const notificationUtils = {
    // 請求權限
    requestPermission: async (): Promise<boolean> => {
        // Electron uses native notifications via IPC, no browser permission needed
        if (typeof (window as any).electronAPI !== 'undefined') return true;

        if (!('Notification' in window)) {
            console.log('Desktop notifications are not supported in this browser');
            return false;
        }

        if (Notification.permission === 'granted') return true;
        // Never re-prompt after an explicit denial
        if (Notification.permission === 'denied') return false;

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
        if ('Notification' in window && Notification.permission === 'granted') {
            // 優先嘗試透過 Service Worker 發送 (PWA 標準)
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                    // Relative to the page so it resolves under the GitHub Pages sub-path
                    registration.showNotification(title, {
                        icon: 'icon-512.png',
                        badge: 'icon-512.png',
                        vibrate: [200, 100, 200],
                        ...options
                    } as NotificationOptions);
                });
            } else {
                // 退而求其次使用普通通知
                new Notification(title, options);
            }
        }
    }
};
