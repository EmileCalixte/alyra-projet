import {useContext, useState} from "react";
import {votingInterfaceContext} from "../VotingInterface";
import {WorkflowStatus} from "../../../../util/WorkflowStatusUtil";
import ProposalsList from "./ProposalsList";

const Proposals = () => {
    const {workflowStatus} = useContext(votingInterfaceContext);

    const [proposals, setProposals] = useState<string[]>([]);

    return(
        <div className="page-content">
            <div className="row">
                <div className="col-12">
                    <h2>Proposals</h2>

                    {workflowStatus === WorkflowStatus.ProposalsRegistrationStarted &&
                    <>TODO submit proposal form</>
                    }

                    <ProposalsList proposals={proposals}/>
                </div>
            </div>
        </div>
    )
}

export default Proposals;
