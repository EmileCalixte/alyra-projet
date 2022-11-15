import '../css/index.css';
import {ethers, providers} from "ethers";
import {useCallback, useEffect, useState} from "react";

import {abi as VOTING_ABI} from "../artifacts/contracts/Voting.sol/Voting.json";

const App = () => {
    const [provider, setProvider] = useState<providers.Web3Provider|undefined|null>(undefined);
    const [account, setAccount] = useState<string|undefined>(undefined);
    const [voting, setVoting] = useState<ethers.Contract|undefined>(undefined);

    useEffect(() => {
        console.log("Initializing provider");

        if (!window.ethereum) {
            console.error("No provider found in navigator");
            setProvider(null);
            return;
        }

        const provider = new providers.Web3Provider(window.ethereum);

        console.log("Provider", provider);

        setProvider(provider);

        console.log("Initializing contract", process.env.REACT_APP_VOTING_ADDRESS, VOTING_ABI);

        const voting = new ethers.Contract(process.env.REACT_APP_VOTING_ADDRESS as string, VOTING_ABI as any, provider);

        setVoting(voting);
    }, []);

    useEffect(() => {
        (window as any).ethereum.on('chainChanged', (chainId: any) => {
            console.log('Chain changed', chainId, parseInt(chainId, 16));
        });
    }, []);

    const connectToMetamask = useCallback(async () => {
        if (!provider) {
            return;
        }

        const accounts = await provider.send("eth_requestAccounts", []);

        setAccount(accounts[0]);
    }, [provider]);

    console.log(voting);

    return (
        <div className="app">
            {account === undefined &&
            <button onClick={connectToMetamask}>Connect to Metamask</button>
            }

            {account !== undefined &&
            <p>Welcome {account}</p>
            }
        </div>
    );
}

export default App;
