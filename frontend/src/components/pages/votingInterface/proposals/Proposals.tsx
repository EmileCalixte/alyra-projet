import {useCallback, useContext, useEffect, useState} from "react";
import {votingInterfaceContext} from "../VotingInterface";
import {WorkflowStatus} from "../../../../util/WorkflowStatusUtil";
import ProposalsList from "./ProposalsList";
import {appContext} from "../../../App";
import AddProposal from "./AddProposal";
import { Navigate } from "react-router-dom";

const Proposals = () => {
    const {workflowStatus} = useContext(votingInterfaceContext);
    const {voting} = useContext(appContext);

    const [proposals, setProposals] = useState<string[]>([]);

    const fetchProposals = useCallback(async () => {
        if (!voting) {
            return;
        }

        const proposalsCount = await voting.getProposalsCount();

        const fetchedProposals: string[] = [];

        for (let i = 0; i < proposalsCount; ++i) {
            fetchedProposals.push((await voting.getOneProposal(i+1)).description);
        }

        setProposals(fetchedProposals);
    }, [voting]);

    const saveAddedProposal = useCallback((proposal: string) => {
        setProposals([...proposals, proposal]);
    }, [proposals]);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    if (workflowStatus !== undefined && workflowStatus < WorkflowStatus.ProposalsRegistrationStarted) {
        return (
            <Navigate to="/" replace/>
        );
    }

    return(
        <div className="page-content">
            <div className="row">
                <div className="col-12">
                    <h2>Proposals</h2>

                    {workflowStatus === WorkflowStatus.ProposalsRegistrationStarted &&
                    <AddProposal afterSubmit={saveAddedProposal}/>
                    }

                    <ProposalsList proposals={proposals}/>
                </div>
            </div>
        </div>
    )
}

export default Proposals;
