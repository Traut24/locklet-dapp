import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CLOSE_MODAL, OPEN_MODAL } from 'src/store';

export function useToggleWalletModal() {
    const dispatch = useDispatch();

    const walletModalOpen = useSelector((state) => state.modals.walletManager.show);

    return useCallback(() => {
        if (walletModalOpen) dispatch({ type: CLOSE_MODAL, name: 'walletManager' });
        else dispatch({ type: OPEN_MODAL, name: 'walletManager' });
    }, []);
}
