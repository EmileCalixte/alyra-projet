import {useCallback, useContext, useEffect, useState} from "react";
import {votingInterfaceContext} from "../VotingInterface";
import {appContext} from "../../../App";
import {WorkflowStatus} from "../../../../util/WorkflowStatusUtil";
import {Navigate} from "react-router-dom";

const Vote = () => {
    const {workflowStatus} = useContext(votingInterfaceContext);
    const {account, voting} = useContext(appContext);

    const [proposals, setProposals] = useState<string[]>([]);
    const [votedProposalId, setVotedProposalId] = useState<number|null>(null);

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

    const submitVote = useCallback(async (proposalId: number) => {
        if (!voting) {
            return;
        }

        if (votedProposalId !== null) {
            return;
        }

        await voting.setVote(proposalId+1)

        setVotedProposalId(proposalId+1);
    }, [voting, votedProposalId]);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    useEffect(() => {
        if (!voting || !account) {
            return;
        }

        (async () => {
            const voter = await voting.getVoter(account);

            if (voter.hasVoted) {
                setVotedProposalId(voter.votedProposalId);
            }
        })();
    }, [voting, account]);

    if (workflowStatus !== undefined && workflowStatus < WorkflowStatus.VotingSessionStarted) {
        return (
            <Navigate to="/" replace/>
        );
    }

    return (
        <div className="page-content">
            <div className="row">
                <div className="col-12">
                    <h2>Vote</h2>

                    {votedProposalId === null &&
                    <p>You haven't voted yet. You can only vote for one proposal!</p>
                    }

                    {votedProposalId !== null &&
                    <p>You have voted for the following proposal: {proposals[votedProposalId-1]}</p>
                    }

                    <h3>Submit your vote</h3>

                    {(workflowStatus !== undefined && workflowStatus >= WorkflowStatus.VotingSessionEnded) &&
                    <p>The voting session has ended.</p>
                    }

                    {workflowStatus === WorkflowStatus.VotingSessionStarted &&
                    <table>
                        <thead>
                        <tr>
                            <th>Proposal description</th>
                            <th>Submit vote</th>
                        </tr>
                        </thead>
                        <tbody>
                        {proposals.map((proposal, index) => {
                            return (
                                <tr key={index}>
                                    <td>{proposal}</td>
                                    <td>
                                        <button className="button"
                                                disabled={votedProposalId !== null}
                                                onClick={() => submitVote(index)}
                                        >
                                            Vote
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    }
                </div>
            </div>
        </div>
    )
}

export default Vote;
