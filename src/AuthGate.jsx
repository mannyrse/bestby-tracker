import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Login from './Login'

function AuthGate({ children }) {
    const [session, setSession] = useState(null)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setChecking(false)
        })

        const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
        })

        return () => data.subscription.unsubscribe()
    }, [])

    if (checking) return <p>Loading...</p>
    if (!session) return <Login />

    return (
        <>
            <div className="screen-only auth-bar">
                <span>{session.user.email}</span>
                <button type="button" onClick={() => supabase.auth.signOut()}>
                    Sign out
                </button>
            </div>
            {children}
        </>
    )
}

export default AuthGate