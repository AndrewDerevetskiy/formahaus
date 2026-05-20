import { Switch, Route } from "wouter";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import VendorRegister from "./pages/VendorRegister";
import VendorDashboard from "./pages/VendorDashboard";
import FormaHaus from "./components/FormaHaus";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedVendor from "./components/ProtectedVendor";
import "./styles/pastel-theme.css";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/designer" component={FormaHaus} />
          <Route path="/cart" component={Cart} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/category/:id" component={CategoryPage} />
          <Route path="/product/:id" component={ProductPage} />
          <Route path="/vendor/register" component={VendorRegister} />
          <Route path="/vendor/dashboard">
            <ProtectedVendor>
              <VendorDashboard />
            </ProtectedVendor>
          </Route>
          <Route>
            <Home />
          </Route>
        </Switch>
      </CartProvider>
    </AuthProvider>
  );
}
