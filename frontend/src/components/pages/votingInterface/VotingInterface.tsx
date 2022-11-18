import Header from "../../layout/Header";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Home from "./home/Home";
import {createContext, useContext, useEffect, useState} from "react";
import {appContext} from "../../App";
import {WorkflowStatus} from "../../../util/WorkflowStatusUtil";
import Admin from "./admin/Admin";
import CurrentWorkflowStatusBanner from "./CurrentWorkflowStatusBanner";
import NavBar from "./NavBar";
import NotRegistered from "./notRegistered/NotRegistered";

interface VotingInterfaceContext {
    workflowStatus: WorkflowStatus|undefined,
    isAccountVoter: boolean,
}

export const votingInterfaceContext = createContext<VotingInterfaceContext>({
    workflowStatus: undefined,
    isAccountVoter: false,
});

const VotingInterface = () => {
    const {account, voting} = useContext(appContext);

    const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus|undefined>(undefined);
    const [isAccountVoter, setIsAccountVoter] = useState<boolean>(false);

    useEffect(() => {
        if (!voting) {
            return;
        }

        (async () => {
            setWorkflowStatus(await voting.workflowStatus());

            try {
                console.log("TOTO SETISACCOUNTVOTER", await voting.getVoters(account));
            } catch {
                setIsAccountVoter(false);
            }
        })();
    }, [voting, account]);

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
                isAccountVoter,
            }}>
                <div className="container">
                    {workflowStatus === undefined &&
                    <>Loading...</>
                    }

                    {workflowStatus !== undefined &&
                    <>
                        <CurrentWorkflowStatusBanner workflowStatus={workflowStatus}/>

                        <BrowserRouter>

                            <NavBar/>

                            <Routes>

                                <Route path="/admin" element={<Admin/>}/>

                                {!isAccountVoter &&
                                <Route path="*" element={<NotRegistered/>}/>
                                }

                                {isAccountVoter &&
                                <>
                                    <Route path="/" element={<Home/>}/>

                                    {/* Redirect any unresolved route to home */}
                                    <Route path="*" element={<Navigate to="/" replace/>}/>
                                </>
                                }
                            </Routes>
                        </BrowserRouter>
                    </>
                    }
                </div>
            </votingInterfaceContext.Provider>
        </div>
    )
}

export default VotingInterface;
