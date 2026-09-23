import { describe, it, expect, afterEach, vi } from 'vitest';
import { notificationUtils } from './notificationUtils';

const stubNotification = (permission: NotificationPermission) => {
  const requestPermission = vi.fn(async () => 'granted' as NotificationPermission);
  const Notification = Object.assign(vi.fn(), { permission, requestPermission });
  vi.stubGlobal('Notification', Notification);
  vi.stubGlobal('window', { Notification });
  return { Notification, requestPermission };
};

afterEach(() => vi.unstubAllGlobals());

describe('notificationUtils.requestPermission', () => {
  it('resolves true in Electron without a browser prompt', async () => {
    const { requestPermission } = stubNotification('default');
    vi.stubGlobal('window', { electronAPI: {}, Notification: globalThis.Notification });
    expect(await notificationUtils.requestPermission()).toBe(true);
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('resolves false when the Notification API is missing', async () => {
    vi.stubGlobal('window', {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await notificationUtils.requestPermission()).toBe(false);
  });

  it('does not re-prompt after a denial', async () => {
    const { requestPermission } = stubNotification('denied');
    expect(await notificationUtils.requestPermission()).toBe(false);
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('prompts when permission is undecided', async () => {
    const { requestPermission } = stubNotification('default');
    expect(await notificationUtils.requestPermission()).toBe(true);
    expect(requestPermission).toHaveBeenCalledOnce();
  });
});

describe('notificationUtils.send', () => {
  it('does not throw when the Notification API is missing', () => {
    vi.stubGlobal('window', {});
    expect(() => notificationUtils.send('t', { body: 'b' })).not.toThrow();
  });

  it('routes to Electron IPC when available', () => {
    const sendNotification = vi.fn();
    vi.stubGlobal('window', { electronAPI: { sendNotification } });
    notificationUtils.send('Title', { body: 'Body' });
    expect(sendNotification).toHaveBeenCalledWith({ title: 'Title', body: 'Body' });
  });

  it('shows a plain notification when granted and no service worker controls the page', () => {
    const { Notification } = stubNotification('granted');
    vi.stubGlobal('navigator', {});
    notificationUtils.send('Title', { body: 'Body' });
    expect(Notification).toHaveBeenCalledWith('Title', { body: 'Body' });
  });
});
