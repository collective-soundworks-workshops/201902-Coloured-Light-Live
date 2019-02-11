import * as soundworks from 'soundworks/client';
import FormExperience from './FormExperience';
import serviceViews from '../shared/serviceViews';
import FormPicker from '../shared/services/FormPicker';

function bootstrap() {
  // remove initial loader
  document.body.classList.remove('loading');

  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  soundworks.client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  const experience = new FormExperience(config.assetsDomain);
  soundworks.client.start();
}

window.addEventListener('load', bootstrap);
