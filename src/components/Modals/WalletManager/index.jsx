import { Modal, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useDispatch, useSelector } from 'react-redux';
import MetamaskIcon from 'src/assets/images/providers/metamask.png';
import AccountDetails from 'src/components/AccountDetails';
import { fortmatic, injected, portis } from 'src/connectors';
import { OVERLAY_READY } from 'src/connectors/Fortmatic';
import { SUPPORTED_WALLETS } from 'src/constants';
import usePrevious from 'src/hooks/usePrevious';
import { CLOSE_MODAL, OPEN_MODAL } from 'src/store';
import styled from 'styled-components';

import Option from './Option';
import PendingView from './PendingView';

const ContentWrapper = styled.div`
  padding: 2rem;
  padding-top: 0.25rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
`;

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
};

const WalletManager = () => {
  const dispatch = useDispatch();

  const { active, account, connector, activate, error } = useWeb3React();

  const networkMissmatch = useSelector((state) => state.app.networkMissmatch);

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

  const [pendingWallet, setPendingWallet] = useState();

  const [pendingError, setPendingError] = useState(false);

  const previousAccount = usePrevious(account);

  const walletModalOpen = useSelector((state) => state.modals.walletManager.show);

  const toggleWalletModal = () => {
    if (walletModalOpen) dispatch({ type: CLOSE_MODAL, name: 'walletManager' });
    else dispatch({ type: OPEN_MODAL, name: 'walletManager' });
  };

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal();
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen]);

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [walletModalOpen]);

  // close modal when a connection is successful
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious]);

  const tryActivation = async (connector) => {
    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return SUPPORTED_WALLETS[key].name;
      }
      return true;
    });

    setPendingWallet(connector); // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
      connector.walletConnectProvider = undefined;
    }

    connector &&
      activate(connector, undefined, true).catch((error) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector); // a little janky...can't use setError because the connector isn't set
        } else {
          setPendingError(true);
        }
      });
  };

  // close wallet modal if fortmatic modal is active
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, () => {
      toggleWalletModal();
    });
  }, [toggleWalletModal]);

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask;
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key];
      // check for mobile options
      if (isMobile) {
        // disable portis on mobile for now
        if (option.connector === portis) {
          return null;
        }

        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector);
              }}
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={require('src/assets/images/providers/' + option.iconName)}
            />
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === 'MetaMask') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color="#E8831D"
                header="Install Metamask"
                subheader={null}
                link="https://metamask.io/"
                icon={MetamaskIcon}
              />
            );
          }
          return null; // dont want to return install twice
        }
        // don't return metamask if injected provider isn't metamask
        if (option.name === 'MetaMask' && !isMetamask) {
          return null;
        }
        // likewise for generic
        if (option.name === 'Injected' && isMetamask) {
          return null;
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector ? setWalletView(WALLET_VIEWS.ACCOUNT) : !option.href && tryActivation(option.connector);
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} // use option.descriptio to bring back multi-line
            icon={require('src/assets/images/providers/' + option.iconName)}
          />
        )
      );
    });
  }

  function getModalContent() {
    if (error || networkMissmatch) {
      return (
        <>
          <ModalHeader>{error instanceof UnsupportedChainIdError || networkMissmatch ? 'Wrong Network' : 'Error connecting'}</ModalHeader>
          <ContentWrapper>
            {error instanceof UnsupportedChainIdError || networkMissmatch ? (
              <h5>Please connect to the appropriate network.</h5>
            ) : (
              'Error connecting. Try refreshing the page.'
            )}
          </ContentWrapper>
        </>
      );
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return <AccountDetails toggleWalletModal={toggleWalletModal} openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)} />;
    }
    return (
      <>
        {walletView !== WALLET_VIEWS.ACCOUNT ? (
          <ModalHeader
            onClick={() => {
              setPendingError(false);
              setWalletView(WALLET_VIEWS.ACCOUNT);
            }}
            style={{ cursor: 'pointer' }}
          >
            Back
          </ModalHeader>
        ) : (
          <ModalHeader>Connect to a wallet</ModalHeader>
        )}
        <ModalCloseButton />
        <ContentWrapper>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView connector={pendingWallet} error={pendingError} setPendingError={setPendingError} tryActivation={tryActivation} />
          ) : (
            <OptionGrid>{getOptions()}</OptionGrid>
          )}
        </ContentWrapper>
      </>
    );
  }

  return (
    <Modal isOpen={walletModalOpen} onClose={toggleWalletModal}>
      <ModalOverlay />
      <ModalContent>{getModalContent()}</ModalContent>
    </Modal>
  );
};

export default WalletManager;
