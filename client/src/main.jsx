import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux"; // Added import for Redux Provider
import store from "./store/store.js"; // Added import for Redux store (assuming path client/src/store/store.js)
import SearchContextProvider from "./context/SearchContext.jsx";
import CartContextProvider from "./context/CartContext.jsx";
import WishlistContextProvider from "./context/WishlistContext.jsx";
import { theme } from "./utils/theme.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}> {/* Wrapped application with Redux Provider */}
      <ChakraProvider theme={theme}>
        <SearchContextProvider>
          <CartContextProvider>
            <WishlistContextProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </WishlistContextProvider>
          </CartContextProvider>
        </SearchContextProvider>
      </ChakraProvider>
    </Provider>
  </React.StrictMode>
);
