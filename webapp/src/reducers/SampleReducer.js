"use strict";

const initialState = {
  greeting: "Hello there !!!",
  accounts: []
};

const SampleReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case "SET_GREETING":
      newState = {
        ...state
      };
      newState.greeting = action.greeting;
      return newState;
    case "SET_ACCOUNTS":
      newState = {
        ...state
      };
      newState.accounts = action.accounts;
      return newState;
    default:
      return state;
  }
};

export default SampleReducer;
