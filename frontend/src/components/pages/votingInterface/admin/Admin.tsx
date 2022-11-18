import {useCallback, useContext, useEffect, useState} from "react";
import {Navigate} from "react-router-dom";
import {appContext} from "../../../App";
import {votingInterfaceContext} from "../VotingInterface";
import {WorkflowStatus} from "../../../../util/WorkflowStatusUtil";
import AddVoter from "./AddVoter";

const Admin = () => {
    const {workflowStatus} = useContext(votingInterfaceContext);
    const {isAccountOwner, voting} = useContext(appContext);

    const [registeredVoters, setRegisteredVoters] = useState<string[]>([]);

    const fetchRegisteredVoters = useCallback(async () => {
        if (!voting) {
            return;
        }

        const registeredVotersCount = await voting.getRegisteredVoterCount();

        const fetchedVoters: string[] = [];

        for (let i = 0; i < registeredVotersCount; ++i) {
            fetchedVoters.push(await voting.registeredVoters(i));
        }

        setRegisteredVoters(fetchedVoters);
    }, [voting])

    const saveAddedVoter = useCallback(async (address: string) => {
        setRegisteredVoters([...registeredVoters, address]);
    }, [registeredVoters]);

    useEffect(() => {
        fetchRegisteredVoters();
    }, [fetchRegisteredVoters]);

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
                    <AddVoter alreadyRegisteredVoters={registeredVoters}
                              afterSubmit={saveAddedVoter}
                    />
                    }
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <h3>Registered voters</h3>

                    {registeredVoters.length === 0 &&
                    <p><i>No voters have been registered yet</i></p>
                    }

                    {registeredVoters.length > 0 &&
                    <ul>
                        {registeredVoters.map((voter, index) => {
                            return (
                                <li key={index}>{voter}</li>
                            );
                        })}
                    </ul>
                    }
                </div>
            </div>
        </div>
    );
}

export default Admin;
