import { useState, useEffect } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import "./CompoundItem.css";
import Deposit from "src/components/DepositPool/DepositPool";
import PoolButton from "src/components/PoolButton/PoolButton";
import Withdraw from "src/components/WithdrawPool/WithdrawPool";
import { CgInfo } from "react-icons/cg";
import { Tooltip } from "react-tooltip";
import {
    apyPool,
    calculateFarmAPY,
    calculateFeeAPY,
    findCompoundAPY,
    findTotalAPY,
    getTotalVaultBalance,
    getUserVaultBalance,
    priceToken,
    totalFarmAPY,
} from "./compound-functions";
import Details from "src/components/CompoundItem/Details";
import useApp from "src/hooks/useApp";
import useWallet from "src/hooks/useWallet";
import uuid from "react-uuid";

function CompoundItem({ pool }: any) {
    const { connectWallet, currentWallet } = useWallet();
    const { lightMode } = useApp();
    const [dropdown, setDropDown] = useState(false);
    const [buttonType, setButtonType] = useState("Deposit");

    const [userVaultBal, setUserVaultBalance] = useState(0);
    const [totalVaultBalance, setTotalVaultBalance] = useState(0);

    const [priceOfSingleToken, setPriceOfSingleToken] = useState(0);

    const [details, setDetails] = useState(false);
    const [rewardAPY, setRewardApy] = useState(0);
    const [feeAPY, setFeeAPY] = useState(0);

    const [apyVisionCompound, setAPYVisionCompound] = useState(0);
    const [compoundAPY, setCompoundAPY] = useState(0);

    const [totalAPY, setTotalAPY] = useState(0);
    const [apyVisionAPY, setAPYVisionAPY] = useState(0);

    useEffect(() => {
        getUserVaultBalance(pool, currentWallet, setUserVaultBalance);
        getTotalVaultBalance(pool, setTotalVaultBalance);
    }, [pool, currentWallet]);

    useEffect(() => {
        priceToken(pool.lp_address, setPriceOfSingleToken);
        apyPool(pool.lp_address, setRewardApy);
        calculateFeeAPY(pool.lp_address, setFeeAPY);
        calculateFarmAPY(rewardAPY, setAPYVisionCompound);
        findCompoundAPY(pool.rewards_apy, setCompoundAPY, pool.total_apy, pool.platform);
        findTotalAPY(pool.rewards_apy, setTotalAPY, pool.total_apy, pool.platform);
        totalFarmAPY(rewardAPY, feeAPY, setAPYVisionAPY);
    }, [pool, totalVaultBalance, userVaultBal, rewardAPY, feeAPY]);

    const key = uuid();

    return (
        <div className={`pools ${lightMode && "pools--light"}`}>
            <div className="single_pool" key={pool.id} onClick={() => setDropDown(!dropdown)}>
                <div className="row_items">
                    <div className="title_container">
                        <div className="pair">
                            {pool.logo1 ? (
                                <img
                                    alt={pool.alt1}
                                    className={`logofirst ${lightMode && "logofirst--light"}`}
                                    src={pool.logo1}
                                />
                            ) : null}

                            {pool.logo2 ? (
                                <img
                                    alt={pool.alt2}
                                    className={`logo ${lightMode && "logo--light"}`}
                                    src={pool.logo2}
                                />
                            ) : null}
                        </div>

                        <div>
                            <div className="pool_title">
                                <p className={`pool_name ${lightMode && "pool_name--light"}`}>{pool.name}</p>
                                <div className="rewards_div">
                                    <p className={`farm_type ${lightMode && "farm_type--light"}`}>{pool.platform}</p>
                                    <img alt={pool.platform_alt} className="rewards_image" src={pool.platform_logo} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How much the user has deposited */}

                    {userVaultBal * priceOfSingleToken < 0.01 ? (
                        <div className={`container ${lightMode && "container--light"}`}>
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}></p>
                            <p className={`tvlLP ${lightMode && "tvlLP--light"}`}></p>
                        </div>
                    ) : (
                        <div className={`container ${lightMode && "container--light"}`}>
                            <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                {(userVaultBal * priceOfSingleToken).toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                })}
                            </p>
                            <p className={`tvlLP ${lightMode && "tvlLP--light"}`}>{userVaultBal.toFixed(10)}</p>
                        </div>
                    )}

                    <div className="pool_info">
                        <div className={`container__apy ${lightMode && "container__apy--light"}`}>
                            {userVaultBal * priceOfSingleToken < 0.01 ? (
                                <p className={`pool_name__apy ${lightMode && "pool_name__apy--light"}`}></p>
                            ) : (
                                <p className={`pool_name__apy ${lightMode && "pool_name__apy--light"}`}>
                                    {((userVaultBal / totalVaultBalance) * 100).toFixed(2)} %
                                </p>
                            )}
                        </div>

                        {totalVaultBalance * priceOfSingleToken < 0.01 ? (
                            <div className={`container ${lightMode && "container--light"}`}>
                                <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                    {(0).toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    })}
                                </p>

                                <p className={`tvlLP ${lightMode && "tvlLP--light"}`}>0</p>
                            </div>
                        ) : (
                            <div className={`container ${lightMode && "container--light"}`}>
                                <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                    {(totalVaultBalance * priceOfSingleToken).toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    })}
                                </p>

                                <p className={`tvlLP ${lightMode && "tvlLP--light"}`}>
                                    {totalVaultBalance.toFixed(10)}
                                </p>
                            </div>
                        )}

                        <div className={`container1 ${lightMode && "container1--light"}`}>
                            {!pool.total_apy ? (
                                <div className={`container1_apy ${lightMode && "container1_apy--light"}`}>
                                    <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                        {apyVisionAPY.toFixed(2)}%
                                    </p>
                                    <a
                                        id={key}
                                        data-tooltip-html={`<p>
                                            <b>Base APRs</b>
                                        </p>
                                        <p>LP Rewards: ${rewardAPY.toFixed(2)}%</p>
                                        <p>Trading Fees: ${feeAPY.toFixed(2)}%</p>
                                        <p>Compounding: ${apyVisionCompound.toFixed(2)}%</p>`}
                                    >
                                        <CgInfo className={`apy_info hoverable ${lightMode && "apy_info--light"}`} />
                                    </a>
                                    <Tooltip
                                        anchorId={key}
                                        className={`${lightMode ? "apy_tooltip--light" : "apy_tooltip"}`}
                                    />
                                </div>
                            ) : (
                                <div className={`container1_apy ${lightMode && "container1_apy--light"}`}>
                                    <p className={`pool_name ${lightMode && "pool_name--light"}`}>
                                        {totalAPY.toFixed(2)}%
                                    </p>
                                    <a
                                        id={key}
                                        data-tooltip-html={`<p>
                                            <b>Base APRs</b>
                                        </p>
                                        <p>LP Rewards: ${Number(pool.rewards_apy).toFixed(2)}%</p>
                                        <p>Compounding: ${compoundAPY.toFixed(2)}%</p>`}
                                    >
                                        <CgInfo className={`apy_info hoverable ${lightMode && "apy_info--light"}`} />
                                    </a>
                                    <Tooltip
                                        anchorId={key}
                                        className={`${lightMode ? "apy_tooltip--light" : "apy_tooltip"}`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`dropdown ${lightMode && "dropdown--light"}`}>
                        {dropdown === false ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
                    </div>
                </div>
            </div>

            {dropdown === false ? null : (
                <div className={`dropdown_menu ${lightMode && "dropdown_menu--light"}`}>
                    <div className="drop_buttons">
                        <PoolButton
                            onClick={() => setButtonType("Deposit")}
                            description="deposit"
                            active={buttonType === "Deposit"}
                        />
                        <PoolButton
                            onClick={() => setButtonType("Withdraw")}
                            description="withdraw"
                            active={buttonType === "Withdraw"}
                        />
                    </div>

                    {buttonType === "Deposit" && <Deposit pool={pool} />}

                    {buttonType === "Withdraw" && <Withdraw pool={pool} />}

                    {details === false ? (
                        <div
                            className={`see_details_dropdown ${lightMode && "see_details_dropdown--light"}`}
                            onClick={() => setDetails(true)}
                        >
                            <p className={`see_details_description ${lightMode && "see_details_description--light"}`}>
                                See more details
                            </p>
                            <RiArrowDownSLine />
                        </div>
                    ) : (
                        <Details
                            lightMode={lightMode}
                            currentWallet={currentWallet}
                            pool={pool}
                            onClick={() => setDetails(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default CompoundItem;
