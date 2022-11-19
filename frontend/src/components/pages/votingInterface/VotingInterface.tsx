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
import Util from "../../../util/Util";
import Proposals from "./proposals/Proposals";
import Vote from "./vote/Vote";
import Results from "./results/Results";

interface VotingInterfaceContext {
    workflowStatus: WorkflowStatus|undefined,
    setWorkflowStatus: (workflowStatus: WorkflowStatus) => any,
    isAccountVoter: boolean,
}

export const votingInterfaceContext = createContext<VotingInterfaceContext>({
    workflowStatus: undefined,
    setWorkflowStatus: () => {},
    isAccountVoter: true,
});

const VotingInterface = () => {
    const {account, voting} = useContext(appContext);

    const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus|undefined>(undefined);
    const [isAccountVoter, setIsAccountVoter] = useState<boolean>(true);

    useEffect(() => {
        if (!voting) {
            return;
        }

        (async () => {
            setWorkflowStatus(await voting.workflowStatus());

            try {
                setIsAccountVoter((await voting.getVoter(account)).isRegistered);
            } catch (error) {
                console.error(error);
                setIsAccountVoter(false);
            }
        })();
    }, [voting, account]);

    // Watch for WorkflowStatusChange event
    useEffect(() => {
        if (!voting) {
            return;
        }

        const onWorkflowStatusChange = (previousStatus: WorkflowStatus, newStatus: WorkflowStatus) => {
            setWorkflowStatus(newStatus);
        }

        voting.on("WorkflowStatusChange", onWorkflowStatusChange);

        return (() => {
            voting.off("WorkflowStatusChange", onWorkflowStatusChange);
        })
    }, [voting]);

    // Watch for VoterRegistered event
    useEffect(() => {
        if (!voting || !account) {
            return;
        }

        const onVoterRegistered = (address: string) => {
            if (Util.areAddressesEqual(address, account)) {
                setIsAccountVoter(true);
            }
        }

        voting.on("VoterRegistered", onVoterRegistered);

        return (() => {
            voting.off("VoterRegistered", onVoterRegistered);
        })
    }, [voting, account])

    return (
        <div className="voting-app">
            <Header/>

            <votingInterfaceContext.Provider value={{
                workflowStatus,
                setWorkflowStatus,
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
                                    <Route path="/proposals" element={<Proposals/>}/>
                                    <Route path="/vote" element={<Vote/>}/>
                                    <Route path="/results" element={<Results/>}/>

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

            <div className="contract-address">
                Contract address: {voting?.address}
            </div>
        </div>
    )
}

export default VotingInterface;
