import { useState, useEffect, useMemo } from "react";
import { Token } from "src/types";
import { floorToFixed } from "src/utils/common";
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
            set.add(farm.token1.toLowerCase());
            if (farm.token2) set.add(farm.token2.toLowerCase());
        }
        set.forEach((address) => {
            const farm = farms.find(
                (farm) => farm.token1.toLowerCase() === address || farm.token2?.toLowerCase() === address
            );
            const decimals =
                (farm?.token1.toLowerCase() === address
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

    const { prices, isLoading: isLoadingPrices } = usePriceOfTokens([
        ethAddress,
        ...tokenAddresses.map((_) => _.address),
    ]);

    const { formattedBalances, refetch, isLoading: isLoadingBalances } = useBalances(tokenAddresses);

    useEffect(() => {
        const tokens: Token[] = tokenAddresses.map(({ address, decimals }) => {
            const farm = farms.find(
                (farm) => farm.token1.toLowerCase() === address || farm.token2?.toLowerCase() === address
            );
            let obj: Token = {
                address: address,
                decimals: decimals,
                balance:
                    formattedBalances[address] < 1 / 10 ** tokenBalDecimalPlaces
                        ? formattedBalances[address].toPrecision(2).slice(0, -1)
                        : floorToFixed(formattedBalances[address], tokenBalDecimalPlaces).toString(),
                usdBalance:
                    prices[address] * formattedBalances[address] < 1 / 10 ** usdBalDecimalPlaces
                        ? (prices[address] * formattedBalances[address]).toPrecision(2).slice(0, -1)
                        : floorToFixed(prices[address] * formattedBalances[address], usdBalDecimalPlaces).toString(),
                logo: farm?.logo1 || "",
                name: farm?.name1 || "",
            };
            return obj;
        });
        const ethToken = {
            address: ethAddress,
            balance:
                ethBalance < 1 / 10 ** tokenBalDecimalPlaces
                    ? ethBalance.toPrecision(2).slice(0, -1)
                    : floorToFixed(ethBalance, tokenBalDecimalPlaces).toString(),
            decimals: 18,
            logo: ethLogo,
            name: "ETH",
            network: networkId === 1 ? "Mainnet" : "Arbitrum",
            usdBalance:
                ethBalance * prices[ethAddress] < 1 / 10 ** usdBalDecimalPlaces
                    ? (ethBalance * prices[ethAddress]).toPrecision(2).slice(0, -1)
                    : floorToFixed(ethBalance * prices[ethAddress], usdBalDecimalPlaces).toString(),
        };
        tokens.unshift(ethToken);
        setTokens(tokens);
    }, [farms, prices, tokenAddresses, ethBalance, networkId, formattedBalances]);

    return { tokens, refetchBalances: refetch, isLoading: isLoadingBalances || isLoadingPrices };
};
