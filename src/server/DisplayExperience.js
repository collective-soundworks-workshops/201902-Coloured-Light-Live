import { Experience } from 'soundworks/server';

class DisplayExperience extends Experience {
  constructor() {
    super('display');

    this.sharedConfig = this.require('shared-config');
    this.sharedParams = this.require('shared-params');
  }

  start() {

  }

  enter(client) {
    super.enter(client);
  }

  exit(client) {
    super.exit(client);
  }
}

export default DisplayExperience;
