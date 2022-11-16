import {useContext} from "react";
import {appContext} from "../App";
import Util from "../../util/Util";

const Header = () => {
    const {account, isAccountOwner} = useContext(appContext);

    return (
        <header className="app-header">
            {Util.shortenAddress(account as string)} {isAccountOwner && "(owner)"}
        </header>
    );
}

export default Header;
