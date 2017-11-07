import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';

@Injectable()
export class SocketService {
  private socketInstance;
  private listeners: Listeners = new Listeners();

  constructor() {
    this._connect();
  }

  private _handleMessage(msg: MessageEvent): void {
    let key = null;
    let msgData;
    if (msg && msg.data) {
      try {
        msgData = JSON.parse(msg.data);
        if (msgData.event) {
          key = msgData.event;
        }
      } catch (e) {}
    }
    if (key && this.listeners.isKeyRegistered(key, msgData.payload.action)) {
      this.listeners.executeHandlers(key, msgData.payload.action, msgData.payload.data);
    } else {
      console.log('Unhandled Message received', msg);
    }
  }

  private _connect(): void {
    this.socketInstance = new WebSocket(environment.SOCKET_URL);
    this._setErrorHandlers();
    this.socketInstance.onopen = this._onConnection.bind(this);
  }

  private _setErrorHandlers(): void {
    this.socketInstance.onclose = this._reconnect.bind(this);
  }

  private _reconnect(): void {
    setTimeout(() => {
      this._connect();
    }, 5000);
  }

  private _onConnection(event): void {
    this.socketInstance.onmessage = this._handleMessage.bind(this);
    this.socketInstance.send('Seer dashboard instance connected');
  }

  registerListener({event, actions}) {
    for (let action in actions) {
      if (actions.hasOwnProperty(action)) {
        this.listeners.register(event, action, actions[action]);
      }
    }
  }

}

class Listeners {
  private myListeners = {};
  constructor() {}

  register(key: string, action: string, handler: Function): void {
    if (!this.myListeners.hasOwnProperty(key)) {
      this.myListeners[key] = {};
    }
    if (!this.myListeners[key].hasOwnProperty(action)) {
      this.myListeners[key][action] = [];
    }
    this.myListeners[key][action].push(handler);
  }

  isKeyRegistered(key: string, action: string): boolean {
    return !!this.myListeners[key] && !!this.myListeners[key][action];
  }

  executeHandlers(key: string, action: string, payload: {}): void {
    if (this.myListeners.hasOwnProperty(key) && this.myListeners[key].hasOwnProperty(action)) {
      this.myListeners[key][action].forEach(handler => handler(payload));
    }
  }
}
