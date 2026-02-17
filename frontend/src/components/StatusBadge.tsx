interface StatusBadgeProps {
    status: string;
}

const statusConfig: Record<string, { bg: string; text: string }> = {
    RECEIVED: { bg: 'bg-blue-50', text: 'text-blue-600' },
    PACKED: { bg: 'bg-purple-50', text: 'text-purple-600' },
    DISPATCHED: { bg: 'bg-orange-50', text: 'text-orange-600' },
    IN_TRANSIT: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    DELIVERED: { bg: 'bg-green-50', text: 'text-green-600' },
    RETURNED: { bg: 'bg-red-50', text: 'text-red-600' },
    PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-600' }
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const config = statusConfig[status] || { bg: 'bg-gray-50', text: 'text-gray-600' };

    return (
        <span className={`text-[10px] font-black px-2 py-1 ${config.bg} ${config.text} rounded-md uppercase tracking-wider`}>
            {status}
        </span>
    );
};

export default StatusBadge;
