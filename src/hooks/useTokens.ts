import { useState, useEffect, useMemo } from "react";
import { Token } from "src/types";
import { toFixedFloor } from "src/utils/common";
import useFarms from "./farms/useFarms";
import useBalances from "./useBalances";
import usePriceOfTokens from "./usePriceOfTokens";
import useWallet from "./useWallet";
import ethLogo from "src/assets/images/ethereum-icon.png";
import { constants } from "ethers";

const ethAddress = constants.AddressZero;
const tokenBalDecimalPlaces = 3;
const usdBalDecimalPlaces = 2;

export const useTokens = () => {
    const { farms } = useFarms();
    const { balance: ethBalance, networkId } = useWallet();
    const [tokens, setTokens] = useState<Token[]>([]);

    const tokenAddresses = useMemo(() => {
        const set = new Set<string>();
        const arr: { address: string; decimals: number }[] = [];
        for (const farm of farms) {
            set.add(farm.token1);
            if (farm.token2) set.add(farm.token2);
        }
        set.forEach((address) => {
            const farm = farms.find((farm) => farm.token1 === address || farm.token2 === address);
            const decimals =
                (farm?.token1 === address
                    ? // @ts-ignore
                      farm.decimals1
                    : // @ts-ignore
                    farm?.decimals2
                    ? // @ts-ignore
                      farm?.decimals2
                    : farm?.decimals) || 18;
            if (farm) {
                arr.push({ address, decimals });
            }
        });
        return arr;
    }, [farms]);

    const { prices, isLoading: isLoadingPrices } = usePriceOfTokens();

    const { formattedBalances, isLoading: isLoadingBalances } = useBalances();

    useEffect(() => {
        const tokens: Token[] = tokenAddresses.map(({ address, decimals }) => {
            const farm = farms.find((farm) => farm.token1 === address || farm.token2 === address);
            const isToken1 = farm?.token1 === address;
            let obj: Token = {
                address: address,
                decimals: decimals,
                balance: formattedBalances[address]
                    ? formattedBalances[address]! < 1 / 10 ** tokenBalDecimalPlaces
                        ? formattedBalances[address]!.toPrecision(2).slice(0, -1)
                        : toFixedFloor(formattedBalances[address]!, tokenBalDecimalPlaces).toString()
                    : "0",
                usdBalance: formattedBalances[address]
                    ? prices[address] * formattedBalances[address]! < 1 / 10 ** usdBalDecimalPlaces
                        ? (prices[address] * formattedBalances[address]!).toPrecision(2).slice(0, -1)
                        : toFixedFloor(prices[address] * formattedBalances[address]!, usdBalDecimalPlaces).toString()
                    : "0",
                logo: isToken1 ? farm?.logo1 : farm?.logo2 || "",
                name: isToken1 ? farm?.name1 : farm?.name2 || "",
            };
            return obj;
        });
        const ethToken = {
            address: ethAddress,
            balance:
                ethBalance < 1 / 10 ** tokenBalDecimalPlaces
                    ? ethBalance.toPrecision(2).slice(0, -1)
                    : toFixedFloor(ethBalance, tokenBalDecimalPlaces).toString(),
            decimals: 18,
            logo: ethLogo,
            name: "ETH",
            network: networkId === 1 ? "Mainnet" : "Arbitrum",
            usdBalance:
                ethBalance * prices[ethAddress] < 1 / 10 ** usdBalDecimalPlaces
                    ? (ethBalance * prices[ethAddress]).toPrecision(2).slice(0, -1)
                    : toFixedFloor(ethBalance * prices[ethAddress], usdBalDecimalPlaces).toString(),
        };
        tokens.unshift(ethToken);
        setTokens(tokens);
    }, [farms, prices, tokenAddresses, ethBalance, networkId, formattedBalances]);

    return { tokens, isLoading: isLoadingBalances || isLoadingPrices };
};
