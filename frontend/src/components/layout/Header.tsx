import {useContext} from "react";
import {appContext} from "../App";
import Util from "../../util/Util";

const Header = () => {
    const {account, isAccountOwner, chainId} = useContext(appContext);

    return (
        <header className="app-header">
            <div className="header-network">
                Network: {Util.getChainName(chainId as number)}
            </div>
            <div className="flex-spacer"/>
            <div className="header-account">
                {Util.shortenAddress(account as string)} {isAccountOwner && "(owner)"}
            </div>
        </header>
    );
}

export default Header;
