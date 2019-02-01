import { Experience } from 'soundworks/server';

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor() {
    super('player');

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.sharedParams = this.require('shared-params');
    this.osc = this.require('osc');

    this.onStartTrace = this.onStartTrace.bind(this);
    this.onMoveTrace = this.onMoveTrace.bind(this);
    this.onStopTrace = this.onStopTrace.bind(this);
  }

  start() {}

  enter(client) {
    super.enter(client);

    this.sharedParams.update('numPlayers', this.clients.length);
    this.receive(client, 'start-light', this.onStartTrace);
    this.receive(client, 'move-light', this.onMoveTrace);
    this.receive(client, 'stop-light', this.onStopTrace);
  }

  exit(client) {
    super.exit(client);

    // make shure that finger leaves display when disconnecting
    this.broadcast('display', null, 'stop-light', client.index);

    this.sharedParams.update('numPlayers', this.clients.length);
  }

  onStartTrace(playerId, x, y, color) {
    this.broadcast('display', null, 'start-light', playerId, x, y, color);
  }

  onMoveTrace(playerId, x, y) {
    this.broadcast('display', null, 'move-light', playerId, x, y);
  }

  onStopTrace(playerId, x, y) {
    this.broadcast('display', null, 'stop-light', playerId);
  }
}
