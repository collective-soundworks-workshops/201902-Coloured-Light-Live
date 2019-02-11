import 'source-map-support/register'; // enable sourcemaps in node
import path from 'path';
import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
import DisplayExperience from './DisplayExperience';
import ControllerExperience from './ControllerExperience';

const configName = process.env.ENV || 'default';
const configPath = path.join(__dirname, 'config', configName);
let config = null;

// rely on node `require` as the path is dynamic
try {
  config = require(configPath).default;
} catch(err) {
  console.error(`Invalid ENV "${configName}", file "${configPath}.js" not found`);
  process.exit(1);
}

process.env.NODE_ENV = config.env;

if (process.env.PORT) {
  config.port = process.env.PORT;
}


soundworks.server.init(config);

soundworks.server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    clientType: clientType,
    env: config.env,
    appName: config.appName,
    websockets: config.websockets,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

const sharedParams = soundworks.server.require('shared-params');
sharedParams.addText('numPlayers', '# players', '0');
sharedParams.addText('numLights', '# lights', '0');
sharedParams.addText('numForms', '# forms', '0');
sharedParams.addNumber('formRatio', 'form ratio', 0, 1, 0.01, 0.1);
sharedParams.addNumber('directIntensity', 'direct intensity', 0, 1, 0.01, 0.4);
sharedParams.addNumber('strayIntensity', 'stray intensity', 0, 1, 0.01, 0.2);
sharedParams.addNumber('screenDistance', 'screen distance', 0, 1, 0.01, 0.1);
sharedParams.addNumber('rehearsalLight', 'rehearsal light', 0, 1, 0.01, 0);
sharedParams.addTrigger('reload', 'reload all clients');

const light = new PlayerExperience('light');
const form = new PlayerExperience('form');
const display = new DisplayExperience();
const controller = new ControllerExperience();

soundworks.server.start();
