import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { network } from 'src/connectors';
import { NetworkContextName } from 'src/constants';
import { useEagerConnect, useInactiveListener } from 'src/hooks';

import CircleLoader from '../Loaders/CircleLoader';

export default function Web3ReactManager({ children }) {
  const { active } = useWeb3React();
  const { active: networkActive, error: networkError, activate: activateNetwork, chainId } = useWeb3React(NetworkContextName);

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  const appNetwork = useSelector((state) => state.app.network);
  const [previousAppNetwork, setPreviousAppNetwork] = useState(appNetwork);

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    const networkConnector = network(appNetwork);

    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(networkConnector);
    } else if (previousAppNetwork !== appNetwork) {
      activateNetwork(networkConnector);
      setPreviousAppNetwork(appNetwork);
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active, appNetwork]);

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager);

  // handle delayed loader state
  const [showLoader, setShowLoader] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true);
    }, 600);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null;
  }

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (!active && networkError) {
    return <span>Unknown error</span>;
  }

  // if neither context is active, spin
  if (!active && !networkActive) {
    return showLoader ? <CircleLoader /> : null;
  }

  return children;
}
