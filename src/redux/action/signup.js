import { createSlice } from '@reduxjs/toolkit';

const signUp = createSlice({
  name: 'signUp',
  initialState: {
    user: {},
  },
  reducers: {
    saveUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { saveUser } = signUp.actions;

export const signupReducer = signUp.reducer;
