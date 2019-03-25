import { fromJS } from 'immutable';
import { Dispatch } from 'redux';

const FETCH_USER_INFO = 'account/fetchUserInfo';

const INIT_STATE = fromJS({
  userInfo: {
    userId: '',
    userName: '',
    profilePictureUrl: '',
    registeredDate: '',
  },
});

export default function reducer(state = INIT_STATE, action: any = {}) {
  if (!action.type) {
    return state;
  }

  const data = action.data ? action.data : {};

  switch (action.type) {
    case FETCH_USER_INFO:
      state = state.set('userInfo', data);
      break;
  }
  return state;
}

export function fetchUserInfo() {
  return (dispatch: Dispatch) => {
    dispatch({
      type: FETCH_USER_INFO,
      data: {},
    });
  };
}
