import { Switch, Route } from "wouter";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import FormaHaus from "./components/FormaHaus";

export default function App() {
  return (
    <CartProvider>
      <Switch>
        <Route path="/"          component={Home}      />
        <Route path="/designer"  component={FormaHaus} />
        <Route path="/cart"      component={Cart}      />
        <Route>
          <Home />
        </Route>
      </Switch>
    </CartProvider>
  );
}
