import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router";

function AuthMiddleware (){
    const {isLogged} = useContext(AuthContext)

    if(isLogged){
        //Es como next() en los middlewares, te lleva a la ruta que querias entrar
        return <Outlet/>
    }
    else{
        return <Navigate to={'/login'}/>
    }
}

export default AuthMiddleware