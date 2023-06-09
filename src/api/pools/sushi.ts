import pools from "src/config/constants/pools.json";
import { Farm } from "src/types";
import { constants, BigNumber, Signer, Contract, utils } from "ethers";
import { approveErc20, getBalance } from "src/api/token";
import { toEth, validateNumberDecimals } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { blockExplorersByChainId } from "src/config/constants/urls";
import { addressesByChainId } from "src/config/constants/contracts";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
import {
    DepositFn,
    DynamicFarmFunctions,
    GetFarmDataProcessedFn,
    TokenAmounts,
    WithdrawFn,
    ZapInFn,
    ZapOutFn,
} from "./types";
import { defaultChainId } from "src/config/constants";
import { zapInBase, zapOutBase } from "./common";

let sushi: DynamicFarmFunctions = function (farmId) {
    const farm = pools.find((farm) => farm.id === farmId) as Farm;

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals) => {
        const ethPrice = prices[constants.AddressZero];
        const lpAddress = farm.lp_address;
        const lpPrice = prices[lpAddress];
        const vaultBalance = BigNumber.from(balances[farm.vault_addr]);

        const usdcAddress = addressesByChainId[defaultChainId].usdcAddress;

        let depositableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: toEth(balances[usdcAddress]!, decimals[usdcAddress]),
                amountDollar: (
                    Number(toEth(balances[usdcAddress]!, decimals[usdcAddress])) * prices[usdcAddress]
                ).toString(),
                price: prices[usdcAddress],
            },
            {
                tokenAddress: constants.AddressZero,
                tokenSymbol: "ETH",
                amount: toEth(balances[constants.AddressZero]!, 18),
                amountDollar: (Number(toEth(balances[constants.AddressZero]!, 18)) * ethPrice).toString(),
                price: ethPrice,
            },
            {
                tokenAddress: lpAddress,
                tokenSymbol: farm.name,
                amount: toEth(balances[lpAddress]!, decimals[lpAddress]),
                amountDollar: (Number(toEth(balances[lpAddress]!, decimals[lpAddress])) * prices[lpAddress]).toString(),
                price: prices[lpAddress],
            },
        ];

        let withdrawableAmounts: TokenAmounts[] = [
            {
                tokenAddress: usdcAddress,
                tokenSymbol: "USDC",
                amount: ((Number(toEth(vaultBalance)) * lpPrice) / prices[usdcAddress]).toString(),
                amountDollar: (Number(toEth(vaultBalance)) * lpPrice).toString(),
                price: prices[usdcAddress],
            },
            {
                tokenAddress: constants.AddressZero,
                tokenSymbol: "ETH",
                amount: ((Number(toEth(vaultBalance)) * lpPrice) / ethPrice).toString(),
                amountDollar: (Number(toEth(vaultBalance)) * lpPrice).toString(),
                price: ethPrice,
            },
            {
                tokenAddress: lpAddress,
                tokenSymbol: farm.name,
                amount: toEth(vaultBalance),
                amountDollar: (Number(toEth(vaultBalance)) * lpPrice).toString(),
                price: prices[lpAddress],
                isPrimaryVault: true,
            },
        ];

        const result = {
            depositableAmounts,
            withdrawableAmounts,
            vaultBalanceFormated: toEth(vaultBalance, farm.decimals),
            id: farm.id,
        };
        return result;
    };

    const deposit: DepositFn = async ({ amountInWei, currentWallet, signer, chainId, max }) => {
        if (!signer) return;
        let notiId = notifyLoading(loadingMessages.approvingDeposit());
        const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId];
        try {
            const vaultContract = new Contract(farm.vault_addr, farm.vault_abi, signer);

            const lpBalance = await getBalance(farm.lp_address, currentWallet, signer.provider!);

            // approve the vault to spend asset
            await approveErc20(farm.lp_address, farm.vault_addr, lpBalance, currentWallet, signer);

            dismissNotify(notiId);
            notifyLoading(loadingMessages.confirmDeposit(), { id: notiId });

            let depositTxn: any;
            if (max) {
                depositTxn = await vaultContract.depositAll();
            } else {
                depositTxn = await vaultContract.deposit(amountInWei);
            }
            dismissNotify(notiId);
            notifyLoading(loadingMessages.depositing(depositTxn.transactionHash), {
                id: notiId,
                // buttons: [
                //     {
                //         name: "View",
                //         // @ts-ignore
                //         onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${depositTxn.hash}`, "_blank"),
                //     },
                // ],
            });

            const depositTxnStatus = await depositTxn.wait(1);
            if (!depositTxnStatus.status) {
                throw new Error("Error depositing into vault!");
            } else {
                notifySuccess(successMessages.deposit());
                dismissNotify(notiId);
            }
        } catch (error: any) {
            console.log(error);
            let err = JSON.parse(JSON.stringify(error));
            dismissNotify(notiId);
            notifyError(errorMessages.generalError(err.reason || err.message));
        }
    };

    const withdraw: WithdrawFn = async ({ amountInWei, currentWallet, signer, chainId, max }) => {
        if (!signer) return;
        const BLOCK_EXPLORER_URL = blockExplorersByChainId[chainId];
        const notiId = notifyLoading(loadingMessages.approvingWithdraw());
        try {
            const vaultContract = new Contract(farm.vault_addr, farm.vault_abi, signer);

            dismissNotify(notiId);
            notifyLoading(loadingMessages.confirmingWithdraw(), { id: notiId });

            let withdrawTxn: any;
            if (max) {
                withdrawTxn = await vaultContract.withdrawAll();
            } else {
                withdrawTxn = await vaultContract.withdraw(amountInWei);
            }

            dismissNotify(notiId);
            notifyLoading(loadingMessages.withDrawing(withdrawTxn.bundleTransactionHash), {
                id: notiId,
                // buttons: [
                //     {
                //         name: "View",
                //         // @ts-ignore
                //         onClick: () => window.open(`${BLOCK_EXPLORER_URL}/tx/${withdrawTxn.bundleTransactionHash}`, "_blank"),
                //     },
                // ],
            });

            const withdrawTxnStatus = await withdrawTxn.wait(1);
            if (!withdrawTxnStatus.status) {
                throw new Error("Error withdrawing Try again!");
            } else {
                dismissNotify(notiId);
                notifySuccess(successMessages.withdraw());
            }
        } catch (error) {
            let err = JSON.parse(JSON.stringify(error));
            console.log(err);
            dismissNotify(notiId);
            notifyError(errorMessages.generalError(err.reason || err.message));
        }
    };

    const zapIn: ZapInFn = (props) => zapInBase({ ...props, farm });

    const zapOut: ZapOutFn = (props) => zapOutBase({ ...props, farm });

    return { getProcessedFarmData, deposit, withdraw, zapIn, zapOut };
};

export default sushi;
