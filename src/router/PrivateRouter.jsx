import { Navigate } from "react-router-dom";
import { CalendarPage } from "../calendar/pages/CalendarPage";

export const PrivateRoute = () => {
    return [
        {
            path: "/",
            element: <CalendarPage />,
        },
        {
            path: "/*",
            element: <Navigate to='/' />,
        },
    ];
}