import {useContext} from "react";
import {Navigate} from "react-router-dom";
import {appContext} from "../../../App";

const Admin = () => {
    const {isAccountOwner} = useContext(appContext);

    if (!isAccountOwner) {
        return (
            <Navigate to="/" replace/>
        );
    }

    return (
        <>Admin</>
    );
}

export default Admin;
