import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { logoutUser } from "../../utils/logout";
import { User } from "../../interfaces/userInterface";
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  role: string | null;
  user: User | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  role: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; role: string }>
    ) => {
      const { token, role } = action.payload;
      console.log(action.payload);
      state.isAuthenticated = true;
      state.token = token;
      state.role = role;
      console.log(token);
      console.log(role);
      Cookies.set("jwt_token", token, { expires: 15 / (24 * 60) });
      Cookies.set("role", role, { expires: 15 / (24 * 60) });
      console.log(state.isAuthenticated, state.token, state.role);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.role = null;
      Cookies.remove("jwt_token");
      Cookies.remove("role");
      logoutUser();
    },
    loadAuthFromCookies: (state) => {
      const token = Cookies.get("jwt_token");
      const role = Cookies.get("role");
      console.log("Token from cookies:", token);
      console.log("Role from cookies:", role);

      if (token) {
        state.isAuthenticated = true;
        state.token = token;
        state.role = role || null;
      } else {
        state.isAuthenticated = false;
        state.token = null;
        state.role = null;
      }
    },
    getUserDetails: (state, action) => {
      state.user = action.payload;
      console.log("User details:", state.user);
    },
  },
});

export const { loginSuccess, logout, loadAuthFromCookies, getUserDetails } =
  authSlice.actions;
export default authSlice.reducer;