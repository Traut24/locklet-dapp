import { Center, Modal, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { useSelector } from 'react-redux';
import { useToggleModal } from 'src/hooks/useToggleModal';

export default function RevokeLock() {
  const { chainId, account } = useWeb3React();

  const revokeLockModalOpen = useSelector((state) => state.modals.revokeLock.show);
  const toggleRevokeLockModal = useToggleModal('revokeLock');

  // const revokeLockModalProps = useSelector(state => state.modals.revokeLock)

  return (
    <Modal isOpen={revokeLockModalOpen} onClose={toggleRevokeLockModal} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Revoke Lock</ModalHeader>
        <ModalCloseButton />
        <Center p="2rem" pt="0.25rem">
          This is a test
        </Center>
      </ModalContent>
    </Modal>
  );
}
