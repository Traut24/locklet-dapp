import {
  Button,
  Code,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import capitalize from 'capitalize-sentence';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { TOKEN_VAULT } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { useTransactionAdder } from 'src/hooks/transactions';
import { useTokenVaultContract } from 'src/hooks/useContract';
import { useToggleModal } from 'src/hooks/useToggleModal';

export default function ClaimTokens() {
  // app state
  const { chainId } = useActiveWeb3React();
  const addTx = useTransactionAdder();

  // modal state
  const claimTokensModalOpen = useSelector((state) => state.modals.claimTokens.show);
  const toggleClaimTokensModal = useToggleModal('claimTokens');

  useEffect(() => {
    if (claimTokensModalOpen) toggleClaimTokensModal(); // close modal if chain change
  }, [chainId]);

  const lockIndex = useSelector((state) => state.modals.claimTokens.lockIndex);
  const claimAmount = useSelector((state) => state.modals.claimTokens.claimAmount);
  const onSuccessCallback = useSelector((state) => state.modals.claimTokens.onSuccess);

  // token vault management
  const tokenVaultAddr = TOKEN_VAULT[chainId];
  const tokenVault = useTokenVaultContract(tokenVaultAddr);

  // claim logic
  const [isClaimLoading, setIsClaimLoading] = useState(false);

  const claim = async () => {
    if (lockIndex < 0) return;

    try {
      setIsClaimLoading(true);

      const claimTx = await tokenVault.claimLockedTokens(lockIndex);

      toast.loading('Your transaction is being confirmed...', { id: claimTx.hash });
      addTx(claimTx);

      const claimResult = await claimTx.wait();
      if (claimResult?.status === 1) {
        if (onSuccessCallback) onSuccessCallback();
        toggleClaimTokensModal();
      }
    } catch (err) {
      console.error(err);
      if (err?.error?.message || err?.message || err?.reason) toast.error(capitalize(err?.error?.message || err?.message || err?.reason));
    } finally {
      setIsClaimLoading(false);
    }
  };

  return (
    <Modal isOpen={claimTokensModalOpen} onClose={toggleClaimTokensModal} closeOnOverlayClick={false} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Claim Tokens</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb="2">
            You are about to claim tokens from <Code>Token Lock #{lockIndex}</Code>.
          </Text>
          <FormControl>
            <FormLabel htmlFor="claim-amount">Unlocked amount</FormLabel>
            <Input id="claim-amount" value={claimAmount} isReadOnly />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={toggleClaimTokensModal}>
            Close
          </Button>
          <Button colorScheme="brand" isLoading={isClaimLoading} isDisabled={claimAmount <= 0} onClick={claim}>
            Claim
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
