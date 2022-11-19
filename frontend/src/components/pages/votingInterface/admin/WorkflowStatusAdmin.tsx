import {useContext} from "react";
import {votingInterfaceContext} from "../VotingInterface";
import {WorkflowStatus} from "../../../../util/WorkflowStatusUtil";
import WorkflowStatusItem from "./WorkflowStatusItem";

const WorkflowStatusAdmin = () => {
    const {workflowStatus} = useContext(votingInterfaceContext);

    return (
        <div className="admin-workflow-status">
            <WorkflowStatusItem workflowStatus={WorkflowStatus.RegisteringVoters} num={1}>
                {workflowStatus === WorkflowStatus.RegisteringVoters &&
                <button className="button">
                    End registering voters phase & start proposals registration
                </button>
                }
            </WorkflowStatusItem>

            <WorkflowStatusItem workflowStatus={WorkflowStatus.ProposalsRegistrationStarted} num={2}>
                {workflowStatus === WorkflowStatus.ProposalsRegistrationStarted &&
                "Todo"
                }
            </WorkflowStatusItem>

            <WorkflowStatusItem workflowStatus={WorkflowStatus.ProposalsRegistrationEnded} num={3}>
                {workflowStatus === WorkflowStatus.ProposalsRegistrationEnded &&
                "Todo"
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
