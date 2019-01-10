import axios from 'axios';
import { GET_ERRORS } from './types';
// register user
export const registerUser = (userData, history) => dispatch => {
  // use axios to communicate with the back end
  axios
    .post('/api/users/register', userData)
    .then(res => history.push('/login'))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};
