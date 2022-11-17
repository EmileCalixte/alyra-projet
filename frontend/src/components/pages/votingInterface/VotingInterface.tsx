import Header from "../../layout/Header";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Home from "./home/Home";
import {createContext, useContext, useEffect, useState} from "react";
import {appContext} from "../../App";
import {WorkflowStatus} from "../../../util/WorkflowStatusUtil";

interface VotingInterfaceContext {
    workflowStatus: WorkflowStatus|undefined,
}

export const votingInterfaceContext = createContext<VotingInterfaceContext>({
    workflowStatus: undefined,
});

const VotingInterface = () => {
    const {voting} = useContext(appContext);

    const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus|undefined>(undefined);

    useEffect(() => {
        if (!voting) {
            return;
        }

        (async () => {
            setWorkflowStatus(await voting.workflowStatus());
        })();
    }, [voting]);

    useEffect(() => {
        if (!voting) {
            return;
        }

        const onWorkflowStatusChange = (e: any) => {
            console.log(e);
        }

        voting.on("WorkflowStatusChange", onWorkflowStatusChange);

        return (() => {
            voting.off("WorkflowStatusChange", onWorkflowStatusChange);
        })
    }, [voting]);

    return (
        <div className="voting-app">
            <Header/>

            <votingInterfaceContext.Provider value={{
                workflowStatus,
            }}>
                <div className="container-fluid">
                    {workflowStatus === undefined &&
                    <>Loading...</>
                    }

                    {workflowStatus !== undefined &&
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Home/>}/>

                            {/* Redirect any unresolved route to home */}
                            <Route path="*" element={<Navigate to="/" replace/>}/>
                        </Routes>
                    </BrowserRouter>
                    }
                </div>
            </votingInterfaceContext.Provider>
        </div>
    )
}

export default VotingInterface;
