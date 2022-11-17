import '../css/bootstrap-grid.min.css';
import '../css/index.css';
import {ethers, providers} from "ethers";
import {createContext, useCallback, useEffect, useState} from "react";

import VOTING_JSON from "../artifacts/contracts/Voting.sol/Voting.json";
import Header from "./layout/Header";
import Util from "../util/Util";
import AppError from './pages/AppError';
import ConnectToMetamaskButton from "./ConnectToMetamaskButton";

interface AppContext {
    chainId: number|undefined,
    account: string|undefined,
    isAccountOwner: boolean,
}

export const appContext = createContext<AppContext>({
    chainId: undefined,
    account: undefined,
    isAccountOwner: false,
})

const App = () => {
    const [provider, setProvider] = useState<providers.Web3Provider|undefined|null>(undefined);
    const [chainId, setChainId] = useState<number|undefined>(undefined);
    const [account, setAccount] = useState<string|undefined>(undefined);
    const [voting, setVoting] = useState<ethers.Contract|undefined>(undefined);
    const [isContractNotDeployed, setIscontractNotDeployed] = useState<boolean>(false);

    const [isAccountOwner, setIsAccountOwner] = useState<boolean>(false);

    useEffect(() => {
        console.log("Initializing provider");

        if (!window.ethereum) {
            console.error("No provider found in navigator");
            setProvider(null);
            return;
        }

        const provider = new providers.Web3Provider(window.ethereum);

        console.log("Provider", provider);

        (async () => {
            setChainId((await provider.getNetwork()).chainId);
            setProvider(provider);
        })();
    }, [account]);

    useEffect(() => {
        if (!provider) {
            return;
        }

        console.log("Initializing contract", process.env.REACT_APP_VOTING_ADDRESS, VOTING_JSON.abi);

        const voting = new ethers.Contract(process.env.REACT_APP_VOTING_ADDRESS as string, VOTING_JSON.abi as any, provider);

        setVoting(voting);
    }, [provider]);

    useEffect(() => {
        if (!provider) {
            return;
        }

        (window as any).ethereum.on('chainChanged', () => {
            window.location.reload();
        });

        (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
            console.log('Accounts changed', accounts);
            setAccount(accounts[0]);
        })
    }, [provider]);

    useEffect(() => {
        if (!voting || !account) {
            setIsAccountOwner(false);
            return;
        }

        (async () => {
            try {
                const votingOwner: string = await voting.owner();
                setIsAccountOwner(Util.areAddressesEqual(votingOwner, account));
            } catch (error) {
                // If transaction reverts, then it surely means that the contract does not exist on the network
                setIscontractNotDeployed(true);
            }
        })();
    }, [voting, account]);

    const connectToMetamask = useCallback(async () => {
        if (!provider) {
            return;
        }

        const accounts = await provider.send("eth_requestAccounts", []);

        setAccount(accounts[0]);
    }, [provider]);

    if (provider === undefined) {
        return (
            <div className="app">
                Loading...
            </div>
        )
    }

    if (provider === null) {
        return (
            <AppError>
                No web3 provider found
            </AppError>
        )
    }

    if (chainId !== undefined && !Util.isChainSupported(chainId)) {
        return (
            <AppError>
                Network not supported
            </AppError>
        )
    }

    if (isContractNotDeployed) {
        return (
            <AppError>
                It seems that the contract does not exist on this network
            </AppError>
        )
    }

    if (account === undefined) {
        return (
            <ConnectToMetamaskButton onClick={connectToMetamask}/>
        )
    }

    return (
        <div className="app">
            <appContext.Provider value={{
                chainId,
                account,
                isAccountOwner,
            }}>
                <Header/>
            </appContext.Provider>
        </div>
    );
}

export default App;
