interface Step {
    label: string;
    icon?: string;
}

interface StepProgressProps {
    steps: Step[];
    currentStep: number;
}

export default function StepProgress({ steps, currentStep }: StepProgressProps) {
    return (
        <div className="step-progress">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                let className = 'step-item';
                if (isCompleted) className += ' completed';
                if (isActive) className += ' active';

                return (
                    <div key={index} className={className}>
                        <div className="step-circle">
                            {isCompleted ? '✓' : step.icon || (index + 1)}
                        </div>
                        <span className="step-text">{step.label}</span>
                        {index < steps.length - 1 && <div className="step-line" />}
                    </div>
                );
            })}
        </div>
    );
}
