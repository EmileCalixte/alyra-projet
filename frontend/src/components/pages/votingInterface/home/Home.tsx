import {useContext} from "react";
import {votingInterfaceContext} from "../VotingInterface";
import {WorkflowStatus} from "../../../../util/WorkflowStatusUtil";
import {Link} from "react-router-dom";

const Home = () => {
    const {workflowStatus} = useContext(votingInterfaceContext);

    return (
        <div className="page-content">
            <div className="row">
                <div className="col-12">
                    <h2>Welcome</h2>

                    {workflowStatus === WorkflowStatus.RegisteringVoters &&
                    <p>You are registered as a voter. The proposals registration has not yet started, please check back later to submit proposals.</p>
                    }

                    {workflowStatus === WorkflowStatus.ProposalsRegistrationStarted &&
                    <p>The proposals registration has started. <Link to="/proposals">Click here</Link> to submit a proposal and view existing ones.</p>
                    }

                    {workflowStatus === WorkflowStatus.ProposalsRegistrationEnded &&
                    <p>The proposals registration has ended. <Link to="/proposals">Click here</Link> to view existing proposals. The voting session has not yet started, please check back later to submit your vote.</p>
                    }

                    {workflowStatus === WorkflowStatus.VotingSessionStarted &&
                    <p>The voting session has started. <Link to="/vote">Click here</Link> to submit your vote.</p>
                    }

                    {workflowStatus === WorkflowStatus.VotingSessionEnded &&
                    <p>The voting session has ended. The results have not yet been published, please check back later.</p>
                    }

                    {workflowStatus === WorkflowStatus.VotesTallied &&
                    <p>The voting session has ended and the results have been published. <Link to="/results">Click here</Link> to view results.</p>
                    }
                </div>
            </div>
        </div>
    );
}

export default Home;
