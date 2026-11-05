import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

function Scanner({ onDetected, onClose }) {
    const videoRef = useRef(null)
    const onDetectedRef = useRef(onDetected)
    const [error, setError] = useState('')

    useEffect(() => {
        onDetectedRef.current = onDetected
    })

    useEffect(() => {
        const reader = new BrowserMultiFormatReader()
        let controls = null
        let stopped = false

        const timer = setTimeout(() => {
            reader
                .decodeFromConstraints(
                    { video: { facingMode: 'environment' } },
                    videoRef.current,
                    (result) => {
                        if (result && !stopped) {
                            stopped = true
                            onDetectedRef.current(result.getText())
                        }
                    }
                )
                .then((c) => {
                    if (stopped) {
                        c.stop()
                    } else {
                        controls = c
                    }
                })
                .catch(() => {
                    setError('Could not open the camera. Check that camera permission is allowed.')
                })
        }, 0)

        return () => {
            stopped = true
            clearTimeout(timer)
            if (controls) controls.stop()
        }
    }, [])

    return (
        <div>
            <video ref={videoRef} className="scanner-video" muted playsInline />
            {error && <p>{error}</p>}
            <button type="button" onClick={onClose}>
                Cancel
            </button>
        </div>
    )
}

export default Scanner