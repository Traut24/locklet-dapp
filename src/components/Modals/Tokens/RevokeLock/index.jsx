import { Button, Code, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import capitalize from 'capitalize-sentence';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { TOKEN_VAULT } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { useTransactionAdder } from 'src/hooks/transactions';
import { useTokenVaultContract } from 'src/hooks/useContract';
import { useToggleModal } from 'src/hooks/useToggleModal';

export default function RevokeLock() {
  // app state
  const { chainId } = useActiveWeb3React();
  const addTx = useTransactionAdder();

  // modal state
  const revokeLockModalOpen = useSelector((state) => state.modals.revokeLock.show);
  const toggleRevokeLockModal = useToggleModal('revokeLock');

  useEffect(() => {
    if (revokeLockModalOpen) toggleRevokeLockModal(); // close modal if chain change
  }, [chainId]);

  const lockIndex = useSelector((state) => state.modals.revokeLock.lockIndex);
  const onSuccessCallback = useSelector((state) => state.modals.revokeLock.onSuccess);

  // token vault management
  const tokenVaultAddr = TOKEN_VAULT[chainId];
  const tokenVault = useTokenVaultContract(tokenVaultAddr);

  // revoke logic
  const [isRevocationLoading, setIsRevocationLoading] = useState(false);

  const revoke = async () => {
    if (!lockIndex || lockIndex <= 0) return;

    try {
      setIsRevocationLoading(true);

      const revokeTx = await tokenVault.revokeLock(lockIndex);

      toast.loading('Your transaction is being confirmed...', { id: revokeTx.hash });
      addTx(revokeTx);

      const revokeResult = await revokeTx.wait();
      if (revokeResult?.status === 1) {
        if (onSuccessCallback) onSuccessCallback();
        toggleRevokeLockModal();
      }
    } catch (err) {
      console.error(err);
      if (err?.error?.message || err?.message || err?.reason) toast.error(capitalize(err?.error?.message || err?.message || err?.reason));
    } finally {
      setIsRevocationLoading(false);
    }
  };

  return (
    <Modal isOpen={revokeLockModalOpen} onClose={toggleRevokeLockModal} closeOnOverlayClick={false} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Revoke Token Lock</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          You are about to revoke <Code>Token Lock #{lockIndex}</Code>.<br />
          Are you sure you want to continue?
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={toggleRevokeLockModal}>
            Close
          </Button>
          <Button colorScheme="red" isLoading={isRevocationLoading} onClick={revoke}>
            Revoke
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
