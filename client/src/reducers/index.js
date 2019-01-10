// Add all reducers used in the application into this file ad combine them to a root reducer
import { combineReducers } from 'redux';
// reducers needed for the application
import authReducer from './authReducer';
import errorReducer from './errorReducer';

export default combineReducers({
  auth: authReducer,
  errors: errorReducer
});
