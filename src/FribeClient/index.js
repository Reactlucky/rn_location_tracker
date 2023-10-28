const ioClient = require('socket.io-client');

class FribeClient {
  constructor(appKey, options = {}) {
    this.appKey = appKey;
    this.isConnected = false;
    this.pendingOperations = [];
    this.subscriptions = []; // To keep track of event subscriptions

    let wsUrl =
      process.env.NODE_ENV == 'production'
        ? 'https://staging-events.fribe.io/'
        : 'https://staging-events.fribe.io/';
    this.fribeSocket = ioClient(wsUrl, {
      transports: ['websocket'],
      query: {
        app_key: this.appKey,
      },
    });

    this.fribeSocket.on('connect', () => {
      console.log('Connected to fribe service');
      this.isConnected = true;

      // Process pending operations
      this.pendingOperations.forEach(fn => fn());
      this.pendingOperations = [];

      // Re-subscribe to all stored events upon reconnection
      this.subscriptions.forEach(sub => {
        const payload = {
          app_key: this.appKey,
          action: 'subscribe',
          channel: sub.channel,
          event: sub.event,
        };

        if (!sub.isSubscribed) {
          this.fribeSocket.emit(sub.event, payload); // MAKE CONNECTION AGAIN
          sub.isSubscribed = true;
        }
      });
    });

    this.fribeSocket.on('disconnect', () => {
      console.log('Disconnected from fribe service');
      this.isConnected = false;
      this.subscriptions.forEach(sub => {
        sub.isSubscribed = false;
      });
    });

    this.fribeSocket.on('connect_error', err => {
      console.log('err', err.message);
    });

    this.fribeSocket.on('connect_error', err => {
      console.log('err', err.message);
    });
  }

  // A method that adds a function to the queue or directly executes it
  executeOrQueue(fn) {
    if (this.isConnected) {
      fn();
    } else {
      this.pendingOperations.push(fn);
    }
  }

  subscribe(channel, event, callback) {
    // this.executeOrQueue(() => {
    const payload = {
      app_key: this.appKey || 'husky1',
      action: 'subscribe',
      channel: channel,
      event: event,
    };

    if (this.isConnected) {
      // connected then call immidately
      this.fribeSocket.emit(event, payload);
    }
    this.fribeSocket.on(event, callback); // reigster only one time

    // Store the subscription
    this.subscriptions.push({
      channel,
      event,
      payload,
      callback,
      isSubscribed: this.isConnected,
    });
  }

  trigger(channel, event, payload) {
    let modified_data = {
      app_key: this.appKey || 'husky1',
      action: 'trigger',
      channel: channel,
      event: event,
      data: payload,
    };

    this.executeOrQueue(() => {
      this.fribeSocket.emit(event, modified_data);
    });
  }

  unbind(channel, event) {
    let modified_data = {
      app_key: this.appKey || 'husky1',
      action: 'unbind',
      channel: channel,
      event: event,
    };

    this.executeOrQueue(() => {
      this.fribeSocket.emit(event, modified_data);
    });
  }

  disconnect() {
    this.fribeSocket.disconnect();
  }

  listen(event, callback) {
    /* channel error */
    this.fribeSocket.on(event, callback);
  }

  get connected() {
    this.isConnected;
  }

  get subscribeEventsCount() {
    this.subscriptions.length;
  }

  get subscribeEvents() {
    const names = [];
    this.subscriptions.map(s => {
      names.forEach(s.event);
    });
    return names;
  }
}

module.exports = FribeClient;
