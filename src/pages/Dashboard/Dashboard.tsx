import { useState } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { BsCheckCircle } from "react-icons/bs";
import { FiExternalLink, FiCopy } from "react-icons/fi";
import "./Dashboard.css";
import Vaults from "./JoinedVaults/Vaults";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import { copyToClipboard } from "src/utils";
import useConstants from "src/hooks/useConstants";
import { TokenBalances } from "./TokenBalances/TokenBalances";
import { FaKey } from "react-icons/fa";
import { MdOutlineQrCode2 } from "react-icons/md";
import { ExportPrivateKey } from "src/components/modals/ExportPrivateKey/ExportPrivateKey";
import { ExportPublicKey } from "src/components/modals/ExportPublicKey/ExportPublicKey";
import SupportChatToggle from "src/components/SupportChatToggle/SupportChatToggle";
import { TbGasStation, TbGasStationOff } from "react-icons/tb";
import { useAppDispatch, useAppSelector } from "src/state";
import { toggleSponsoredGas } from "src/state/settings/settingsReducer";

function Dashboard() {
    const { lightMode } = useApp();
    const { sponsoredGas } = useAppSelector((state) => state.settings);
    const { currentWallet, displayAccount, signer } = useWallet();
    const [copied, setCopied] = useState(false);
    const [openPrivateKeyModal, setOpenPrivateKeyModal] = useState(false);
    const [openQrCodeModal, setOpenQrCodeModal] = useState(false);
    const { BLOCK_EXPLORER_URL } = useConstants();
    const dispatch = useAppDispatch();

    const handleGasToggle = () => {
        dispatch(toggleSponsoredGas());
    };

    const copy = () => {
        setCopied(true);
        copyToClipboard(currentWallet, () => setCopied(false));
    };

    return (
        <div className={`dashboard_top_bg ${lightMode && "dashboard_top_bg--light"}`} id="dashboard">
            <div className={`dashboard_header ${lightMode && "dashboard_header--light"}`}>
                <div>
                    <Jazzicon diameter={100} seed={jsNumberForAddress(currentWallet)} />

                    {currentWallet ? (
                        <>
                            <div
                                className={`dashboard_address_header ${lightMode && "dashboard_address_header--light"}`}
                                onClick={copy}
                            >
                                <p
                                    className={`dashboard_address ${lightMode && "dashboard_address--light"}`}
                                    style={{ marginRight: "10px" }}
                                >
                                    {displayAccount}
                                </p>
                                {!copied ? <FiCopy /> : <BsCheckCircle />}
                            </div>
                            <div
                                className={`dashboard_copy ${lightMode && "dashboard_copy--light"}`}
                                onClick={() => window.open(`${BLOCK_EXPLORER_URL}/address/${currentWallet}`, "_blank")}
                            >
                                <p style={{ marginRight: "10px" }}>View on Arbiscan</p>
                                <FiExternalLink />
                            </div>
                        </>
                    ) : (
                        <p className={`dashboard_copy ${lightMode && "dashboard_copy--light"}`}>No Wallet Connected</p>
                    )}
                </div>
                <div className="dashboard-key-icons">
                    <SupportChatToggle />
                    {signer && (
                        <>
                            <FaKey
                                color={lightMode ? "var(--color_grey)" : "#ffffff"}
                                cursor="pointer"
                                size={20}
                                onClick={() => setOpenPrivateKeyModal(true)}
                            />
                            <MdOutlineQrCode2
                                color={lightMode ? "var(--color_grey)" : "#ffffff"}
                                cursor="pointer"
                                size={23}
                                onClick={() => setOpenQrCodeModal(true)}
                            />
                            {sponsoredGas ? (
                                <TbGasStation
                                    color={lightMode ? "var(--color_grey)" : "#ffffff"}
                                    cursor="pointer"
                                    size={23}
                                    onClick={handleGasToggle}
                                />
                            ) : (
                                <TbGasStationOff
                                    color={lightMode ? "var(--color_grey)" : "#ffffff"}
                                    cursor="pointer"
                                    size={23}
                                    onClick={handleGasToggle}
                                />
                            )}
                            {openPrivateKeyModal ? <ExportPrivateKey setOpenModal={setOpenPrivateKeyModal} /> : null}
                            {openQrCodeModal ? <ExportPublicKey setOpenModal={setOpenQrCodeModal} /> : null}
                        </>
                    )}
                </div>
            </div>

            <div className={`dashboard_section`}>
                <TokenBalances />
            </div>

            <div className={`dashboard_section`}>
                <p className={`dashboard_wallet_title ${lightMode && "dashboard_wallet_title--light"}`}>
                    Staked Tokens
                </p>
                <Vaults />
            </div>
        </div>
    );
}

export default Dashboard;
