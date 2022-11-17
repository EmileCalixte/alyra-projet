import React from "react";
import Header from "./layout/Header";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";

const VotingInterface: React.FunctionComponent = () => {
    return (
        <div className="voting-app">
            <Header />

            <div className="container-fluid">
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={"Home"} />

                        {/* Redirect any unresolved route to home */}
                        <Route path="*" element={<Navigate to="/" replace/>}/>
                    </Routes>
                </BrowserRouter>
            </div>
        </div>
    )
}

export default VotingInterface;
