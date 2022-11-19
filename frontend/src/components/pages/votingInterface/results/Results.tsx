import {useCallback, useContext, useEffect, useState} from "react";
import {votingInterfaceContext} from "../VotingInterface";
import {WorkflowStatus} from "../../../../util/WorkflowStatusUtil";
import { Navigate } from "react-router-dom";
import {appContext} from "../../../App";

const Results = () => {
    const {voting} = useContext(appContext);
    const {workflowStatus} = useContext(votingInterfaceContext);

    const [winningProposalDescription, setWinningProposalDescription] = useState<string|undefined>(undefined);

    const fetchWinningProposal = useCallback(async () => {
        if (!voting) {
            return;
        }

        const winningProposalId = await voting.winningProposalID();

        setWinningProposalDescription((await voting.getOneProposal(winningProposalId)).description);
    }, [voting]);

    useEffect(() => {
        fetchWinningProposal();
    }, [fetchWinningProposal]);

    if (workflowStatus !== undefined && workflowStatus < WorkflowStatus.VotesTallied) {
        return (
            <Navigate to="/"/>
        );
    }

    return (
        <div className="page-content">
            <div className="row">
                <div className="col-12">
                    <h2>Results</h2>

                    {winningProposalDescription !== undefined &&
                    <p>Winning proposal: {winningProposalDescription}</p>
                    }
                </div>
            </div>
        </div>
    )
}

export default Results;
