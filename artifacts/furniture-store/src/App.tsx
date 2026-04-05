import { Switch, Route } from "wouter";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import VendorRegister from "./pages/VendorRegister";
import VendorDashboard from "./pages/VendorDashboard";
import FormaHaus from "./components/FormaHaus";

export default function App() {
  return (
    <CartProvider>
      <Switch>
        <Route path="/"                    component={Home}            />
        <Route path="/designer"            component={FormaHaus}       />
        <Route path="/cart"                component={Cart}            />
        <Route path="/category/:id"        component={CategoryPage}    />
        <Route path="/product/:id"         component={ProductPage}     />
        <Route path="/vendor/register"     component={VendorRegister}  />
        <Route path="/vendor/dashboard"    component={VendorDashboard} />
        <Route>
          <Home />
        </Route>
      </Switch>
    </CartProvider>
  );
}
