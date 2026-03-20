const STATUSES = [
    { key: 'PENDING', label: 'Menunggu', icon: '⏳' },
    { key: 'CONFIRMED', label: 'Dikonfirmasi', icon: '✅' },
    { key: 'COMPLETED', label: 'Selesai', icon: '🎉' },
];

interface StatusTimelineProps {
    currentStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export default function StatusTimeline({ currentStatus }: StatusTimelineProps) {
    if (currentStatus === 'CANCELLED') {
        return (
            <div className="status-timeline">
                <div className="timeline-step active">
                    <div className="timeline-dot" style={{ background: 'var(--error)', color: 'white' }}>✕</div>
                    <span className="timeline-label" style={{ color: 'var(--error)' }}>Dibatalkan</span>
                </div>
            </div>
        );
    }

    const currentIndex = STATUSES.findIndex(s => s.key === currentStatus);

    return (
        <div className="status-timeline">
            {STATUSES.map((status, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                let className = 'timeline-step';
                if (isCompleted) className += ' completed';
                if (isActive) className += ' active';

                return (
                    <div key={status.key} className={className}>
                        <div className="timeline-dot">
                            {isCompleted ? '✓' : status.icon}
                        </div>
                        <span className="timeline-label">{status.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
