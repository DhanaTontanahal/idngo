import { Component } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { isSignedIn } from './auth/session';
import { AppShell } from './components/AppShell';
import { ActivatePage } from './pages/ActivatePage';
import { ApplicationPage } from './pages/ApplicationPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ErrorPage } from './pages/ErrorPage';
import { SearchPage } from './pages/SearchPage';
import { SignInPage } from './pages/SignInPage';

function RequireAuth({ children }) {
  if (!isSignedIn()) {
    return <Navigate to="/sign-in" replace />;
  }
  return children;
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <ErrorPage code="500" />;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppShell>
      <AppErrorBoundary>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/error/401" element={<ErrorPage code="401" />} />
          <Route path="/error/500" element={<ErrorPage code="500" />} />
          <Route path="/" element={<RequireAuth><SearchPage /></RequireAuth>} />
          <Route path="/applications/:reference" element={<RequireAuth><ApplicationPage /></RequireAuth>} />
          <Route path="/applications/:reference/documents" element={<RequireAuth><DocumentsPage /></RequireAuth>} />
          <Route path="/applications/:reference/activate" element={<RequireAuth><ActivatePage /></RequireAuth>} />
          <Route path="*" element={<ErrorPage code="404" />} />
        </Routes>
      </AppErrorBoundary>
    </AppShell>
  );
}
