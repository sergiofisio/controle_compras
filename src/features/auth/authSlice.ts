import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  user: { id: string; email: string; name: string } | null;
};

const initialState: AuthState = { user: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthState["user"]>) {
      state.user = action.payload;
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
