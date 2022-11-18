import {useContext} from "react";
import {Navigate} from "react-router-dom";
import {appContext} from "../../../App";
import {votingInterfaceContext} from "../VotingInterface";
import {WorkflowStatus} from "../../../../util/WorkflowStatusUtil";
import AddVoter from "./AddVoter";

const Admin = () => {
    const {workflowStatus} = useContext(votingInterfaceContext);
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

                    {workflowStatus === WorkflowStatus.RegisteringVoters &&
                    <AddVoter/>
                    }
                </div>
            </div>
        </div>
    );
}

export default Admin;
