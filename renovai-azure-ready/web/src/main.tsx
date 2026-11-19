import React from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

type ClientPrincipal = {
  userDetails?: string;
};

type AuthResponse = {
  clientPrincipal?: ClientPrincipal;
};

type AuthStatus = 'loading' | 'anonymous' | 'authenticated' | 'error';

function App() {
  const [authStatus, setAuthStatus] = React.useState<AuthStatus>('loading');
  const [userDetails, setUserDetails] = React.useState('');

  React.useEffect(() => {
    let active = true;

    fetch('/.auth/me', {cache: 'no-store'})
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Authentication check failed with status ${response.status}`);
        }
        return response.json() as Promise<AuthResponse>;
      })
      .then(({clientPrincipal}) => {
        if (!active) return;
        if (clientPrincipal) {
          setUserDetails(clientPrincipal.userDetails ?? '');
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('anonymous');
        }
      })
      .catch(() => {
        if (active) setAuthStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  const signedIn = authStatus === 'authenticated';

  return (
    <main>
      <nav>
        <strong>RenovAI Azure</strong>
        {authStatus === 'loading' ? (
          <span role="status">Checking sign-in...</span>
        ) : signedIn ? (
          <>
            <span>Signed in{userDetails ? ` as ${userDetails}` : ''}</span>
            <a href="/logout">Sign out</a>
          </>
        ) : (
          <a href="/.auth/login/aad">Sign in</a>
        )}
      </nav>
      <section>
        <h1>AI-assisted home concept planning</h1>
        <p>Create renovation concepts, floor-plan ideas, and blueprint-style SVG exports.</p>
        {signedIn ? (
          <p role="status">You're signed in.</p>
        ) : (
          <a className="button" href="/.auth/login/aad">Get started</a>
        )}
        {authStatus === 'error' && (
          <p role="alert">We couldn't verify your sign-in status. Refresh the page and try again.</p>
        )}
      </section>
      <aside>Concept plans only. Verify all construction, code, structural, utility, and permit requirements with qualified local professionals.</aside>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App/>);
