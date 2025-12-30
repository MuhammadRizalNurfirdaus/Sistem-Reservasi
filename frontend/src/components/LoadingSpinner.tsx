export default function LoadingSpinner({ text = 'Memuat...' }: { text?: string }) {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">{text}</p>
        </div>
    );
}
