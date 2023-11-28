import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { PublicRoute } from "./PublicRoute";
import { PrivateRoute } from "./PrivateRouter";
import { useAuthStore } from "../hooks/useAuthStore";
import { useEffect } from "react";

export const AppRouter = () => {

    const { status, checkAuthToken } = useAuthStore();
    //const checkAuth = 'not-authenticated'; //'authenticated';

    useEffect(() => {
      checkAuthToken();
    }, []);

    if( status === 'checking' ) {
      return (
        <h3>Cargando...</h3>
      )
    }

    const router = () => {
      return createBrowserRouter(
        status === 'not-authenticated' ? PublicRoute() : PrivateRoute()
      );
    }

    return (<RouterProvider router={ router() }/>)
}