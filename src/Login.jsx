import { useState } from 'react'
import { supabase } from './lib/supabaseClient'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setBusy(true)
        setError('')

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        })

        if (signInError) {
            setError('Sign-in failed. Check the email and password.')
        }
        setBusy(false)
    }

    return (
        <div className="app login-page">
            <h1 className="login-title">Best-By Tracker</h1>
            <form className="card add-form" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>
                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="btn-primary btn-large"
                    disabled={busy}
                >
                    {busy ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
            {error && <p className="notice error">{error}</p>}
        </div>
    )
}

export default Login