import {useCallback, useContext} from "react";
import {votingInterfaceContext} from "../VotingInterface";
import {WorkflowStatus} from "../../../../util/WorkflowStatusUtil";
import WorkflowStatusItem from "./WorkflowStatusItem";
import {appContext} from "../../../App";

const WorkflowStatusAdmin = () => {
    const {voting} = useContext(appContext);
    const {workflowStatus, setWorkflowStatus} = useContext(votingInterfaceContext);

    const startProposalsRegistering = useCallback(async () => {
        if (!voting) {
            return;
        }

        await voting.startProposalsRegistering();

        setWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted);
    }, [voting, setWorkflowStatus]);

    const endProposalsRegistering = useCallback(async () => {
        if (!voting) {
            return;
        }

        await voting.endProposalsRegistering();

        setWorkflowStatus(WorkflowStatus.ProposalsRegistrationEnded);
    }, [voting, setWorkflowStatus]);

    const startVotingSession = useCallback(async () => {
        if (!voting) {
            return;
        }

        await voting.startVotingSession();

        setWorkflowStatus(WorkflowStatus.VotingSessionStarted);
    }, [voting, setWorkflowStatus]);

    return (
        <div className="admin-workflow-status">
            <WorkflowStatusItem workflowStatus={WorkflowStatus.RegisteringVoters} num={1}>
                {workflowStatus === WorkflowStatus.RegisteringVoters &&
                <button className="button" onClick={startProposalsRegistering}>
                    End registering voters phase & start proposals registration
                </button>
                }
            </WorkflowStatusItem>

            <WorkflowStatusItem workflowStatus={WorkflowStatus.ProposalsRegistrationStarted} num={2}>
                {workflowStatus === WorkflowStatus.ProposalsRegistrationStarted &&
                <button className="button" onClick={endProposalsRegistering}>
                    End proposals registration
                </button>
                }
            </WorkflowStatusItem>

            <WorkflowStatusItem workflowStatus={WorkflowStatus.ProposalsRegistrationEnded} num={3}>
                {workflowStatus === WorkflowStatus.ProposalsRegistrationEnded &&
                <button className="button" onClick={startVotingSession}>
                    Start voting session
                </button>
                }
            </WorkflowStatusItem>

            <WorkflowStatusItem workflowStatus={WorkflowStatus.VotingSessionStarted} num={4}>
                {workflowStatus === WorkflowStatus.VotingSessionStarted &&
                "Todo"
                }
            </WorkflowStatusItem>

            <WorkflowStatusItem workflowStatus={WorkflowStatus.VotingSessionEnded} num={5}>
                {workflowStatus === WorkflowStatus.VotingSessionEnded &&
                "Todo"
                }
            </WorkflowStatusItem>

            <WorkflowStatusItem workflowStatus={WorkflowStatus.VotesTallied} num={6}>
                {workflowStatus === WorkflowStatus.VotesTallied &&
                "Todo"
                }
            </WorkflowStatusItem>
        </div>
    );
}

export default WorkflowStatusAdmin;
