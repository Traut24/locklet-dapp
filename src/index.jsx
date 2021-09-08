import { ChakraProvider } from '@chakra-ui/react';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { NetworkContextName } from './constants';
import App from './layout/App';
import { theme } from './layout/Theme';
import { store } from './store';
import getLibrary from './utils/getLibrary';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

if ('ethereum' in window) {
  window.ethereum.autoRefreshOnNetworkChange = false;
}

(() => {
  ReactDOM.render(
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <BrowserRouter>
            <ChakraProvider theme={theme}>
              <App />
            </ChakraProvider>
          </BrowserRouter>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>,
    document.getElementById('app')
  );
})();

Modal.setAppElement('#app');
