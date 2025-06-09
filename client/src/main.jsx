import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css"; // Corrected: Was "./index.css"
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux"; // Added import for Redux Provider
import store from "./store/store.js"; // Added import for Redux store
import { AuthProvider } from "./contexts/AuthContext.jsx"; // Added AuthProvider
import SearchContextProvider from "./context/SearchContext.jsx"; // Path kept as original, file not provided
import { CartProvider as CartContextProvider } from "./contexts/CartContext.jsx"; // Corrected: Path to plural 'contexts' and named import aliased
import WishlistContextProvider from "./context/WishlistContext.jsx"; // Path kept as original, file not provided
import theme from "./theme.js"; // Corrected: Path from './utils/theme.js' and default import

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}> {/* Redux Provider: Global state management */}
      <ChakraProvider theme={theme}> {/* Chakra UI Provider: UI components and theming, provides useToast */}
        <AuthProvider> {/* Auth Provider: Manages authentication state, uses useToast */}
          <SearchContextProvider> {/* Search Context Provider */}
            <CartContextProvider> {/* Cart Context Provider: Manages cart, uses useToast */}
              <WishlistContextProvider> {/* Wishlist Context Provider */}
                <BrowserRouter> {/* Router Provider: Enables client-side routing */}
                  <App />
                </BrowserRouter>
              </WishlistContextProvider>
            </CartContextProvider>
          </SearchContextProvider>
        </AuthProvider>
      </ChakraProvider>
    </Provider>
  </React.StrictMode>
);
