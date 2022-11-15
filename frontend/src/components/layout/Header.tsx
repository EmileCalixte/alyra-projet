import {useContext} from "react";
import {appContext} from "../App";

const Header = () => {
    const {account} = useContext(appContext);

    return (
        <div style={{border: "1px solid red"}}>
            {account}
        </div>
    );
}

export default Header;
