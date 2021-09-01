import { SET_MODAL_DATA } from '../mutations';

const initialState = {
  walletManager: { show: false },
  revokeLock: { show: false },
  claimTokens: { show: false },
  pullRefund: { show: false }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_MODAL_DATA:
      return {
        ...state,
        [action.name]: {
          ...action.data,
        },
      };
    default:
      return state;
  }
};
