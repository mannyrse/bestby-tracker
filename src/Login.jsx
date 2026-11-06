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
        <div className="app">
            <h1>Best-By Tracker</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />
                <button type="submit" disabled={busy}>
                    {busy ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
            {error && <p>{error}</p>}
        </div>
    )
}

export default Login