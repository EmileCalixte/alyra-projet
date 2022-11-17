import React from "react";

const AppError: React.FunctionComponent<{children?: React.ReactNode}> = ({children}) => {
    return (
        <div className="app-error">
            {children}
        </div>
    );
}

export default AppError;
