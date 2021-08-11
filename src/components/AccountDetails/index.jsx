import { ModalCloseButton, ModalHeader } from '@chakra-ui/react';
import { ExternalLink as LinkIcon } from 'react-feather';
import CoinbaseWalletIcon from 'src/assets/images/providers/coinbaseWalletIcon.svg';
import FortmaticIcon from 'src/assets/images/providers/fortmaticIcon.png';
import PortisIcon from 'src/assets/images/providers/portisIcon.png';
import WalletConnectIcon from 'src/assets/images/providers/walletConnectIcon.svg';
import { fortmatic, injected, portis, walletconnect, walletlink } from 'src/connectors';
import { SUPPORTED_WALLETS } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { getEtherscanLink, shortenAddress } from 'src/utils';
import styled from 'styled-components';

import Identicon from '../Identicon';
import Copy from './Copy';

const InfoCard = styled.div`
  padding: 1rem;
  border: 1px solid rgb(206, 208, 217);
  border-radius: 20px;
  position: relative;
  display: grid;
  grid-row-gap: 12px;
  margin-bottom: 20px;
`;

const AccountGroupingRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  font-weight: 400;
  color: black;

  div {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }
`;

const AccountSection = styled.div`
  padding: 0 1rem;
`;

const YourAccount = styled.div`
  h5 {
    margin: 0 0 1rem 0;
    font-weight: 400;
  }

  h4 {
    margin: 0;
    font-weight: 500;
  }
`;

const AccountControl = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 0;
  width: 100%;
  color: black;

  font-weight: 500;
  font-size: 1.25rem;

  a:hover {
    text-decoration: underline;
  }

  p {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const AddressLink = styled.a`
  font-size: 0.825rem;
  color: #888d9b;
  margin-left: 1rem;
  font-size: 0.825rem;
  display: flex;
  :hover {
    color: #565a69;
  }
`;

const WalletName = styled.div`
  width: initial;
  font-size: 0.825rem;
  font-weight: 500;
  color: #888d9b;
`;

const IconWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`;

export default function AccountDetails({ toggleWalletModal, openOptions }) {
  const { chainId, account, connector } = useActiveWeb3React();

  function formatConnectorName() {
    const { ethereum } = window;
    const isMetaMask = !!(ethereum && ethereum.isMetaMask);
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter((k) => SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK')))
      .map((k) => SUPPORTED_WALLETS[k].name)[0];
    return <WalletName>Connected with {name}</WalletName>;
  }

  function getStatusIcon() {
    if (connector === injected) {
      return (
        <IconWrapper size={16}>
          <Identicon />
        </IconWrapper>
      );
    }
    if (connector === walletconnect) {
      return (
        <IconWrapper size={16}>
          <img src={WalletConnectIcon} alt="wallet connect logo" />
        </IconWrapper>
      );
    }
    if (connector === walletlink) {
      return (
        <IconWrapper size={16}>
          <img src={CoinbaseWalletIcon} alt="coinbase wallet logo" />
        </IconWrapper>
      );
    }
    if (connector === fortmatic) {
      return (
        <IconWrapper size={16}>
          <img src={FortmaticIcon} alt="fortmatic logo" />
        </IconWrapper>
      );
    }
    if (connector === portis) {
      return (
        <>
          <IconWrapper size={16}>
            <img src={PortisIcon} alt="portis logo" />
            <button
              variant="action"
              style={{ fontSize: '.825rem', fontWeight: 400 }}
              className="mr-0"
              onClick={() => {
                portis.portis.showPortis();
              }}
            >
              Show Portis
            </button>
          </IconWrapper>
        </>
      );
    }
    return null;
  }

  return (
    <>
      <ModalHeader>Account</ModalHeader>
      <ModalCloseButton />
      <AccountSection>
        <YourAccount>
          <InfoCard>
            <AccountGroupingRow>
              {formatConnectorName()}
              <div>
                {connector !== injected && connector !== walletlink && (
                  <button
                    variant="action"
                    style={{ fontSize: '.825rem', fontWeight: 400 }}
                    onClick={() => {
                      connector.close();
                    }}
                  >
                    Disconnect
                  </button>
                )}
                <button
                  style={{ fontSize: '.825rem', fontWeight: 400 }}
                  onClick={() => {
                    openOptions();
                  }}
                >
                  Change
                </button>
              </div>
            </AccountGroupingRow>
            <AccountGroupingRow id="web3-account-identifier-row">
              <AccountControl>
                <>
                  <div>
                    {getStatusIcon()}
                    <p> {account && shortenAddress(account)}</p>
                  </div>
                </>
              </AccountControl>
            </AccountGroupingRow>
            <AccountGroupingRow>
              <>
                <AccountControl>
                  <div>
                    {account && (
                      <Copy toCopy={account}>
                        <span style={{ marginLeft: '4px' }}>Copy Address</span>
                      </Copy>
                    )}
                    {chainId && account && (
                      <AddressLink hasENS={false} isENS={false} href={getEtherscanLink(chainId, account, 'address')} target="_blank">
                        <LinkIcon size={16} />
                        <span style={{ marginLeft: '4px' }}>View on Etherscan</span>
                      </AddressLink>
                    )}
                  </div>
                </AccountControl>
              </>
            </AccountGroupingRow>
          </InfoCard>
        </YourAccount>
      </AccountSection>
    </>
  );
}
