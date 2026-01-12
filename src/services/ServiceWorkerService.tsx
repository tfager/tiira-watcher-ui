import { User } from "firebase/auth";

const apiUrl = import.meta.env.REACT_APP_WATCHER_API_URL;

export interface ServiceWorkerMessage {
  type: string;
  [key: string]: any;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  async register(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', this.registration);
        
        // Listen for messages from the service worker
        navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));
        
        return this.registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    console.warn('Service Workers are not supported in this browser');
    return null;
  }

  async unregister(): Promise<boolean> {
    if (this.registration) {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      this.registration = null;
      return result;
    }
    return false;
  }

  sendMessage(message: ServiceWorkerMessage): void {
    if (this.registration && this.registration.active) {
      this.registration.active.postMessage(message);
    } else {
      console.warn('Service Worker not active, cannot send message');
    }
  }

  async startTracking(user: User | null): Promise<void> {
    if (!user) {
      console.error('Cannot start tracking: user not authenticated');
      return;
    }

    const token = await user.getIdToken();
    
    this.sendMessage({
      type: 'START_TRACKING',
      apiUrl: apiUrl,
      token: token,
      userId: user.uid
    });
  }

  stopTracking(): void {
    this.sendMessage({
      type: 'STOP_TRACKING'
    });
  }

  updateInteraction(): void {
    this.sendMessage({
      type: 'UPDATE_INTERACTION'
    });
  }

  sendLocation(lat: number, lng: number): void {
    this.sendMessage({
      type: 'LOCATION_UPDATE',
      location: { lat, lng }
    });
  }

  onMessage(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  private handleMessage(event: MessageEvent): void {
    const { type, ...data } = event.data;
    console.log('Message from Service Worker:', type, data);
    
    const handler = this.messageHandlers.get(type);
    if (handler) {
      handler(data);
    }
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }
}

// Singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();
