import { Experience } from 'soundworks/server';

export default class PlayerExperience extends Experience {
  constructor(type) {
    super(type);

    this.type = type;
    this.numLights = 0;
    this.numForms = 0;

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.sharedParams = this.require('shared-params');
  }

  start() {}

  enter(client) {
    super.enter(client);

    if (this.type === 'light') {
      this.receive(client, 'add-light', (playerId, color, x, y) => this.broadcast('display', null, 'add-light', playerId, color, x, y));
      this.receive(client, 'move-light', (playerId, x, y) => this.broadcast('display', null, 'move-light', playerId, x, y));
      this.receive(client, 'stop-light', (playerId) => this.broadcast('display', null, 'stop-light', playerId));

      this.numLights++;
      this.sharedParams.update('numLights', this.numLights);
    } else if (this.type === 'form') {
      this.receive(client, 'add-form', (playerId, type, x, y, size, shutterIncl, leftShutter, rightShutter) => this.broadcast('display', null, 'add-form', playerId, type, x, y, size, shutterIncl, leftShutter, rightShutter));
      this.receive(client, 'remove-form', (playerId) => this.broadcast('display', null, 'remove-form', playerId));
      this.receive(client, 'move-form', (playerId, x, y) => this.broadcast('display', null, 'move-form', playerId, x, y));
      this.receive(client, 'adjust-form', (playerId, size) => this.broadcast('display', null, 'adjust-form', playerId, size));
      this.receive(client, 'shutter-incl', (playerId, incl) => this.broadcast('display', null, 'shutter-incl', playerId, incl));
      this.receive(client, 'left-shutter', (playerId, dist) => this.broadcast('display', null, 'left-shutter', playerId, dist));
      this.receive(client, 'right-shutter', (playerId, dist) => this.broadcast('display', null, 'right-shutter', playerId, dist));

      this.numForms++;
      this.sharedParams.update('numForms', this.numForms);
    }

    this.sharedParams.update('numPlayers', this.clients.length);
  }

  exit(client) {
    super.exit(client);

    if (this.type === 'light') {
      this.broadcast('display', null, 'remove-light', client.index);

      this.numLights--;
      this.sharedParams.update('numLights', this.numLights);
    } else {
      this.broadcast('display', null, 'remove-form', client.index);

      this.numForms--;
      this.sharedParams.update('numForms', this.numForms);
    }

    this.sharedParams.update('numPlayers', this.clients.length);
  }
}
