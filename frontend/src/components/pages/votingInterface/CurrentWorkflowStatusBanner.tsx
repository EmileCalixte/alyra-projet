import React from "react";
import WorkflowStatusUtil, {WorkflowStatus} from "../../../util/WorkflowStatusUtil";

const CurrentWorkflowStatusBanner: React.FunctionComponent<{workflowStatus: WorkflowStatus}> = ({workflowStatus}) => {
    return (
        <div className="row mt-3 mb-3">
            <div className="col-12">
                <div className="current-workflow-status-banner">
                    Current status: <b>{WorkflowStatusUtil.getWorkflowStatusAsString(workflowStatus)}</b>
                </div>
            </div>
        </div>
    );
}

export default CurrentWorkflowStatusBanner;
