import React from "react";

const AppError: React.FunctionComponent<{children?: React.ReactNode}> = ({children}) => {
    return (
        <div className="app-error">
            <div className="app-error-content">
                {children}
            </div>
        </div>
    );
}

export default AppError;
