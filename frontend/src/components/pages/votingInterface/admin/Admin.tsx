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
        <div className="page-content">
            <div className="row">
                <div className="col-12">
                    <h2>Voters</h2>
                </div>
            </div>
        </div>
    );
}

export default Admin;
