// Global helper to track real Firestore failures and trigger retry without pinging on page load
type RetryCallback = () => Promise<any> | void;

class DbStatusService {
  private isOffline = false;
  private lastRetryFn: RetryCallback | null = null;
  private listeners: Set<(isOffline: boolean) => void> = new Set();

  public subscribe(listener: (isOffline: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isOffline);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public reportFailure(error: any, retryFn?: RetryCallback) {
    const msg = (error?.message || '').toLowerCase();
    const code = error?.code || '';

    // Only report when error is truly offline or network unavailable
    if (
      msg.includes('offline') ||
      msg.includes('client is offline') ||
      msg.includes('network') ||
      code === 'unavailable' ||
      code === 'failed-precondition' ||
      (typeof navigator !== 'undefined' && !navigator.onLine)
    ) {
      this.isOffline = true;
      if (retryFn) {
        this.lastRetryFn = retryFn;
      }
      this.notify();
    }
  }

  public reportSuccess() {
    if (this.isOffline) {
      this.isOffline = false;
      this.notify();
    }
  }

  public async retry(): Promise<void> {
    if (this.lastRetryFn) {
      try {
        await this.lastRetryFn();
        this.reportSuccess();
      } catch (err) {
        this.reportFailure(err);
      }
    } else {
      // If no retry function was set, check if online
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        this.reportSuccess();
      }
    }
  }

  public getStatus(): boolean {
    return this.isOffline;
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.isOffline));
  }
}

export const dbStatus = new DbStatusService();
