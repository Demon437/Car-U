import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/admin/login" />;
    }

    return children;
};

export default ProtectedRoute;
