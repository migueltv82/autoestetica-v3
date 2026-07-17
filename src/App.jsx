import RouterProviderApp from "./app/router";
import { AuthProvider } from "./context/AuthContext";
import { FeedbackProvider } from "./context/FeedbackContext";
import ErrorBoundary from "./components/ui/ErrorBoundary";

function App() {
  return <ErrorBoundary><AuthProvider><FeedbackProvider><RouterProviderApp /></FeedbackProvider></AuthProvider></ErrorBoundary>;
}

export default App;
