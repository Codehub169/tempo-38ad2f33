import { configureStore } from '@reduxjs/toolkit';

// Placeholder reducer - replace with your actual reducers
const rootReducer = (state = {}, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

const store = configureStore({
  reducer: rootReducer,
  // Add middleware, enhancers, etc. here if needed
});

export default store;