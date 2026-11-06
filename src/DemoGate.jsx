import { resetDemo } from '@db'

function DemoGate({ children }) {
    function handleReset() {
        if (window.confirm('Reset the demo? Your changes will be erased.')) {
            resetDemo()
            window.location.reload()
        }
    }

    return (
        <>
            <div className="screen-only auth-bar">
                <span>Demo: your changes stay in this browser only.</span>
                <button type="button" onClick={handleReset}>
                    Reset demo
                </button>
            </div>
            {children}
        </>
    )
}

export default DemoGate