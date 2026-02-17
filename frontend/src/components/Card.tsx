interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

const Card = ({ children, className = "", title }: CardProps) => {
    return (
        <div className={`premium-card ${className}`}>
            {title && (
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
