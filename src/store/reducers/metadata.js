import { APPEND_METADATA } from '../mutations';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case APPEND_METADATA:
      return {
        ...state,
        [action.key]: action.value
      };
    default:
      return state;
  }
};
