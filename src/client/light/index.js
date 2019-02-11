import * as soundworks from 'soundworks/client';
import LightExperience from './LightExperience';
import serviceViews from '../shared/serviceViews';
import ColorPicker from '../shared/services/ColorPicker';

function bootstrap() {
  // remove initial loader
  document.body.classList.remove('loading');

  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  soundworks.client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  const experience = new LightExperience(config.assetsDomain);
  soundworks.client.start();
}

window.addEventListener('load', bootstrap);
