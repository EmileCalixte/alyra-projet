export enum WorkflowStatus {
    RegisteringVoters = 0,
    ProposalsRegistrationStarted = 1,
    ProposalsRegistrationEnded = 2,
    VotingSessionStarted = 3,
    VotingSessionEnded = 4,
    VotesTallied = 5
}

export default class WorkflowStatusUtil {
    constructor() {
        throw new Error("This class cannot be instanciated");
    }

    static getWorkflowStatusAsString(workflowStatus: WorkflowStatus): string {
        switch (workflowStatus) {
            case WorkflowStatus.RegisteringVoters:
                return "Registering voters";
            case WorkflowStatus.ProposalsRegistrationStarted:
                return "Proposals registration started";
            case WorkflowStatus.ProposalsRegistrationEnded:
                return "Proposals registration ended";
            case WorkflowStatus.VotingSessionStarted:
                return "Voting session started";
            case WorkflowStatus.VotingSessionEnded:
                return "Voting session ended";
            case WorkflowStatus.VotesTallied:
                return "Votes tallied";
        }
    }
}
