import { Navigate } from 'react-router-dom';
import { LoginPage } from '../auth/pages/LoginPage.jsx';

export const PublicRoute = () => {
  return [ 
    { 
      path: "/auth/*",       
      element: <LoginPage />,  
    },
    { 
      path: "/*",       
      element: <Navigate to='/auth' />,  
    },
  ];
}