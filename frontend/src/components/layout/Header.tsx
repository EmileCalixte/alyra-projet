import {useContext} from "react";
import {appContext} from "../App";

const Header = () => {
    const {account, isAccountOwner} = useContext(appContext);

    return (
        <header className="app-header">
            {account} {isAccountOwner && "(owner)"}
        </header>
    );
}

export default Header;
