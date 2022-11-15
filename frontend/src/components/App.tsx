import '../css/index.css';
import {ethers} from "ethers";
import {useEffect, useState} from "react";

const App = () => {
    const [account, setAccount] = useState<string|undefined>(undefined);

    const connectToMetamask = async () => {
        if (!window.ethereum) {
            console.error("No provider found in navigator");
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);

        console.log('provider', provider);

        const accounts = await provider.send("eth_requestAccounts", []);

        console.log(accounts);

        setAccount(accounts[0]);
    }

    useEffect(() => {
        (window as any).ethereum.on('chainChanged', (chainId: any) => {
            console.log('Chain changed', chainId, parseInt(chainId, 16));
        });
    }, []);

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
