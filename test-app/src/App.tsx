import { useAuth } from './auth/useAuth'
import { GoogleLoginButton } from './auth/GoogleLoginButton'

function App() {
  const { user, loading, session, signOut } = useAuth()

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Auth Kit Test</h1>

      {user ? (
        <div>
          <div style={{
            padding: '1rem',
            background: '#f0fdf4',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <p><strong>Logged in as:</strong></p>
            <p>{user.email}</p>
            {user.name && <p>Name: {user.name}</p>}
            {user.avatar && (
              <img
                src={user.avatar}
                alt="Avatar"
                style={{ width: 50, height: 50, borderRadius: '50%', marginTop: '0.5rem' }}
              />
            )}
          </div>

          {session && (
            <div style={{
              padding: '1rem',
              background: '#f0f9ff',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <p><strong>Session Info:</strong></p>
              <p>First login: {session.firstLoginAt.toLocaleString()}</p>
              <p>Last login: {session.lastLoginAt.toLocaleString()}</p>
              <p>Login count: {session.loginCount}</p>
            </div>
          )}

          <button
            onClick={signOut}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            Click the button below to sign in with Google
          </p>
          <GoogleLoginButton />
        </div>
      )}
    </div>
  )
}

export default App
