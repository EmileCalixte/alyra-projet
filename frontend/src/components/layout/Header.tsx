import {useContext} from "react";
import {appContext} from "../App";
import Util from "../../util/Util";

const Header = () => {
    const {account, isAccountOwner, chainId} = useContext(appContext);

    return (
        <header className="app-header">
            Network: {Util.getChainName(chainId as number)}
            &nbsp;-&nbsp;
            {Util.shortenAddress(account as string)} {isAccountOwner && "(owner)"}
        </header>
    );
}

export default Header;
