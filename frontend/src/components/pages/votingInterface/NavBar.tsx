import {useContext, useMemo} from "react";
import {appContext} from "../../App";
import {votingInterfaceContext} from "./VotingInterface";
import {WorkflowStatus} from "../../../util/WorkflowStatusUtil";
import NavBarItem from "./NavBarItem";

const NavBar = () => {
    const {isAccountOwner} = useContext(appContext);
    const {workflowStatus} = useContext(votingInterfaceContext);

    const workflowStatusForNavBar = useMemo<WorkflowStatus>(() => {
        if (workflowStatus === undefined) {
            return WorkflowStatus.RegisteringVoters
        }

        return workflowStatus;
    }, [workflowStatus]);

    return (
        <nav className="app-navbar">
            <ul>
                <NavBarItem to="/">Home</NavBarItem>

                <NavBarItem to="/proposals"
                            disabled={workflowStatusForNavBar < WorkflowStatus.ProposalsRegistrationStarted}
                >
                    Proposals
                </NavBarItem>

                <NavBarItem to="/vote"
                            disabled={workflowStatusForNavBar < WorkflowStatus.VotingSessionStarted}
                >
                    Vote
                </NavBarItem>

                <NavBarItem to="/results"
                            disabled={workflowStatusForNavBar < WorkflowStatus.VotesTallied}
                >
                    Results
                </NavBarItem>

                {isAccountOwner &&
                <NavBarItem to="/admin">Admin</NavBarItem>
                }
            </ul>
        </nav>
    );
}

export default NavBar;
