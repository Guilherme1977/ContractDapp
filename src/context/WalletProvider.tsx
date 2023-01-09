import React from "react";
import { getUserSession, setUserSession } from "../store/localStorage";
import * as ethers from "ethers";
import { removeUserSession } from "../store/localStorage";
import { useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react";
import { defaultChainId } from "src/config/constants";

export const WalletContext = React.createContext({
    currentWallet: "",
    displayAccount: "",
    connectWallet: () => {},
    networkId: defaultChainId,
    logout: () => {},
    signer: null as any,
    provider: null as any,
});

interface IProps {
    children: React.ReactNode;
}

const WalletProvider: React.FC<IProps> = ({ children }) => {
    const [{ wallet }, connect, disconnect, updateBalances, setWalletModules] = useConnectWallet();
    const connectedWallets = useWallets();
    const [currentWallet, setCurrentWallet] = React.useState("");
    const [networkId, setNetworkId] = React.useState(defaultChainId);
    const [provider, setProvider] = React.useState<ethers.ethers.providers.Web3Provider | null>(null);
    const [signer, setSigner] = React.useState<ethers.ethers.providers.JsonRpcSigner | null>(null);
    const [
        {
            chains, // the list of chains that web3-onboard was initialized with
            connectedChain, // the current chain the user's wallet is connected to
            settingChain, // boolean indicating if the chain is in the process of being set
        },
        setChain, // function to call to initiate user to switch chains in their wallet
    ] = useSetChain();

    const connectWallet = async () => {
        const wallets = await connect();
        // TODO: Remove set user session
        if (wallets) {
            setUserSession({
                address: wallets[0].accounts[0].address,
                networkId: wallets[0].chains[0].id,
            });

            setCurrentWallet(wallets[0].accounts[0].address);
            setNetworkId(parseInt(wallets[0].chains[0].id, 16));
        }
    };

    async function network() {
        const chainId = 42161;
        if (!connectedChain?.id) return;
        if (connectedChain.id !== chainId.toString()) {
            try {
                await setChain({
                    chainId: chainId.toString(),
                });
            } catch (err: any) {
                // This error code indicates that the chain has not been added to MetaMask
                if (err.code === 4902) {
                    await wallet?.provider?.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainName: "Arbitrum One",
                                chainId: "0xA4B1",
                                nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
                                rpcUrls: ["https://arb1.arbitrum.io/rpc/"],
                            },
                        ],
                    });
                }
            }
        }
    }

    async function logout() {
        removeUserSession();
        setCurrentWallet("");
        if (wallet) disconnect(wallet);
    }

    const displayAccount = React.useMemo(
        () => `${currentWallet.substring(0, 6)}...${currentWallet.substring(currentWallet.length - 5)}`,
        [currentWallet]
    );

    React.useEffect(() => {
        const data = getUserSession();
        if (data) {
            const userInfo = JSON.parse(data);
            setCurrentWallet(userInfo.address);
            setNetworkId(userInfo.networkId);
        }
    }, []);

    React.useEffect(() => {
        network();
    }, [connectedChain, wallet, provider]);

    React.useEffect(() => {
        if (wallet) {
            const provider = new ethers.providers.Web3Provider(wallet.provider, "any");
            setProvider(provider);
            provider.send("eth_requestAccounts", []).then(() => {
                const signer = provider.getSigner();
                setSigner(signer);
            });
        }
    }, [wallet]);

    React.useEffect(() => {
        if (!connectedWallets.length) return;

        const connectedWalletsLabelArray = connectedWallets.map(({ label }) => label);
        localStorage.setItem("connectedWallets", JSON.stringify(connectedWalletsLabelArray));
    }, [connectedWallets, wallet]);

    React.useEffect(() => {
        const previouslyConnectedWallets = JSON.parse(localStorage.getItem("connectedWallets") as string);

        if (previouslyConnectedWallets?.length) {
            connect({
                autoSelect: previouslyConnectedWallets[0],
            }).then((walletConnected) => {
                console.log("connected wallets: ", walletConnected);
            });
        }
    }, [connect]);

    return (
        <WalletContext.Provider
            value={{
                currentWallet,
                connectWallet,
                networkId: parseInt(connectedChain?.id || "0", 16),
                logout,
                displayAccount,
                signer,
                provider,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export default WalletProvider;
