import { Switch, Route } from "wouter";
import Home from "./pages/Home";
import FormaHaus from "./components/FormaHaus";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/designer" component={FormaHaus} />
      <Route>
        <Home />
      </Route>
    </Switch>
  );
}
