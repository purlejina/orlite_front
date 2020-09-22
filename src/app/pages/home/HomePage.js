import React, { Suspense, lazy } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Builder from "./Builder";
import Dashboard from "./Dashboard";
import Volatility from "./Volatility"
import Profile from "./Profile"
import DocsPage from "./docs/DocsPage";
import { LayoutSplashScreen } from "../../../_metronic";
import ResetPassword from "./ResetPassword";

const GoogleMaterialPage = lazy(() =>
  import("./google-material/GoogleMaterialPage")
);
const ReactBootstrapPage = lazy(() =>
  import("./react-bootstrap/ReactBootstrapPage")
);

export default function HomePage() {
  // useEffect(() => {
  //   console.log('Home page');
  // }, []) // [] - is required if you need only one call
  // https://reactjs.org/docs/hooks-reference.html#useeffect

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <Switch>
        {
          /* Redirect from root URL to /dashboard. */
          <Redirect exact from="/" to="/profile" />
        }
        <Route path="/volatility" component={Volatility} />
        <Route path="/profile" component={Profile} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/builder" component={Builder} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/google-material" component={GoogleMaterialPage} />
        <Route path="/react-bootstrap" component={ReactBootstrapPage} />
        <Route path="/docs" component={DocsPage} />
        <Redirect to="/error/error-v1" />
      </Switch>
    </Suspense>
  );
}
