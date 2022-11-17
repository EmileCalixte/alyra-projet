import React from "react";

const ConnectToMetamaskButton: React.FunctionComponent<{onClick: () => any}> = ({onClick}) => {
    return (
        <div className="connect-to-metamask">
            <button className="button big" onClick={onClick}>
                Connect to Metamask
            </button>
        </div>
    );
}

export default ConnectToMetamaskButton;
