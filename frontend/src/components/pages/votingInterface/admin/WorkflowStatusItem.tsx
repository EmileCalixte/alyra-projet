import React, {useContext} from "react";
import WorkflowStatusUtil, {WorkflowStatus} from "../../../../util/WorkflowStatusUtil";
import {votingInterfaceContext} from "../VotingInterface";

const WorkflowStatusItem: React.FunctionComponent<{
    workflowStatus: WorkflowStatus
    num: number,
    children?: React.ReactNode
}> = ({workflowStatus, num, children}) => {
    const {workflowStatus: currentWorkflowStatus} = useContext(votingInterfaceContext);

    return (
        <div className={`admin-workflow-status-item ${workflowStatus === currentWorkflowStatus ? 'current' : ''}`}>
            <div className="admin-workflow-status-num">
                {num}
            </div>
            <div className="admin-workflow-status-block">
                <div className="admin-workflow-status-description">
                    {WorkflowStatusUtil.getWorkflowStatusAsString(workflowStatus)}
                </div>

                {children &&
                <div className="admin-workflow-status-action-container">
                    {children}
                </div>
                }
            </div>
        </div>
    )
}

export default WorkflowStatusItem;
