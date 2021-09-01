import { Button, Center, Code, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TOKEN_VAULT } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { useTransactionAdder } from 'src/hooks/transactions';
import { useTokenVaultContract } from 'src/hooks/useContract';
import { useToggleModal } from 'src/hooks/useToggleModal';
import capitalize from 'capitalize-sentence';
import toast from 'react-hot-toast';

export default function PullRefund() {
  // app state
  const { chainId } = useActiveWeb3React();
  const addTx = useTransactionAdder();

  // modal state
  const pullRefundModalOpen = useSelector((state) => state.modals.pullRefund.show);
  const togglePullRefundModal = useToggleModal('pullRefund');

  useEffect(() => {
    if (pullRefundModalOpen) togglePullRefundModal(); // close modal if chain change
  }, [chainId]);

  const tokenAddress = useSelector((state) => state.modals.pullRefund.tokenAddress);
  const refundAmount = useSelector((state) => state.modals.pullRefund.refundAmount);

  // token vault management
  const tokenVaultAddr = TOKEN_VAULT[chainId];
  const tokenVault = useTokenVaultContract(tokenVaultAddr);

  // refund logic
  const [isRefundLoading, setIsRefundLoading] = useState(false);

  const pull = async () => {
    if (!tokenAddress || tokenAddress <= 0) return;

    try {
      setIsRefundLoading(true);

      const refundTx = await tokenVault.pullRefund(tokenAddress);

      toast.loading('Your transaction is being confirmed...', { id: refundTx.hash });
      addTx(refundTx);

      const refundResult = await refundTx.wait();
      if (refundResult?.status === 1) togglePullRefundModal();
    } catch (err) {
      console.error(err);
      if (err?.error?.message || err?.message || err?.reason) toast.error(capitalize(err?.error?.message || err?.message || err?.reason));
    } finally {
      setIsRefundLoading(false);
    }
  };

  return (
    <Modal isOpen={pullRefundModalOpen} onClose={togglePullRefundModal} closeOnOverlayClick={false} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Pull Refund</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
        <Text mb="2">You are about to pull refund for <Code>Token {tokenAddress}</Code>.</Text>
          <FormControl>
            <FormLabel htmlFor="refund-amount">Refund amount</FormLabel>
            <Input id="refund-amount" value={refundAmount} isReadOnly />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={togglePullRefundModal}>
            Close
          </Button>
          <Button colorScheme="blue" isLoading={isRefundLoading} onClick={pull}>Pull</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
