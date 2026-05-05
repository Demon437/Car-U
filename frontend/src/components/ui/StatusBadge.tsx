interface StatusBadgeProps {
  label: string;
  type?: "online" | "offline" | "pending";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  type = "pending",
}) => {
  const colors = {
    online: "bg-green-100 text-green-700",
    offline: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[type]}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
