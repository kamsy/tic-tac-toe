import { render as rtlRender } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import {
  UserContextProvider,
  AppContextProvider,
  ActiveBusinessContextProvider,
} from "context";

const customRender = (ui, options = {}) => {
  const Wrapper = ({ children }) => {
    return (
      <BrowserRouter>
        <AppContextProvider>
          <UserContextProvider>
            <ActiveBusinessContextProvider>
              {children}
            </ActiveBusinessContextProvider>
          </UserContextProvider>
        </AppContextProvider>
      </BrowserRouter>
    );
  };
  return rtlRender(ui, { wrapper: Wrapper, ...options });
};

export * from "@testing-library/react";
export { customRender as render, userEvent };
