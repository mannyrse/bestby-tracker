function parseLocalDate(isoDate) {
    const [year, month, day] = isoDate.split('-').map(Number)
    return new Date(year, month - 1, day)
}

export function daysUntil(isoDate) {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.round((parseLocalDate(isoDate) - startOfToday) / msPerDay)
}

export function describeDue(isoDate) {
    const days = daysUntil(isoDate)

    if (days < 0) {
        const overdue = Math.abs(days)
        return {
            tone: 'overdue',
            label: `Overdue by ${overdue} ${overdue === 1 ? 'day' : 'days'}`,
        }
    }
    if (days === 0) return { tone: 'soon', label: 'Today' }
    if (days === 1) return { tone: 'soon', label: 'Tomorrow' }
    if (days <= 3) return { tone: 'soon', label: `In ${days} days` }
    return { tone: 'later', label: `In ${days} days` }
}

export function formatDate(isoDate) {
    const date = parseLocalDate(isoDate)
    const sameYear = date.getFullYear() === new Date().getFullYear()
    return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        ...(sameYear ? {} : { year: 'numeric' }),
    })
}