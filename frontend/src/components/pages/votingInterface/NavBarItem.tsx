import React from "react";
import {NavLink} from "react-router-dom";

const NavBarItem: React.FunctionComponent<{
    to: string,
    disabled?: boolean
    children?: React.ReactNode,
}> = ({to, disabled, children}) => {
    return (
        <li>
            {disabled &&
            <span className="navbar-disabled-item">
                {children}
            </span>
            }

            {!disabled &&
            <NavLink to={to}>{children}</NavLink>
            }
        </li>
    )
}

export default NavBarItem;
