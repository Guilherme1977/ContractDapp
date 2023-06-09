import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Farms from "src/pages/Farms/Farms";
import Dashboard from "src/pages/Dashboard/Dashboard";
import Exchange from "./pages/Exchange/Exchange";
import Test from "./pages/Test/Test";
import usePriceOfTokens from "./hooks/usePriceOfTokens";
import { useFarmApys } from "./hooks/farms/useFarmApy";
import useBalances from "./hooks/useBalances";
import useFarmDetails from "./hooks/farms/useFarmDetails";
import useTotalSupplies from "./hooks/useTotalSupplies";
import { useDecimals } from "./hooks/useDecimals";

function Body() {
    const { reloadPrices } = usePriceOfTokens();
    const { reloadApys } = useFarmApys();
    const { reloadBalances } = useBalances();
    const { reloadDecimals } = useDecimals();
    const { reloadSupplies } = useTotalSupplies();
    const { reloadFarmData } = useFarmDetails();

    useEffect(() => {
        reloadPrices();
        // after 5 min reload prices
        const interval = setInterval(() => {
            reloadPrices();
        }, 1000 * 60 * 5);
        return () => clearInterval(interval);
    }, [reloadPrices]);

    useEffect(() => {
        reloadApys();
        // after 5 min reload apys
        const interval = setInterval(() => {
            reloadApys();
        }, 1000 * 60 * 5);
        return () => clearInterval(interval);
    }, [reloadApys]);

    useEffect(() => {
        reloadBalances();
        // after 2 min reload balances
        const interval = setInterval(() => {
            reloadBalances();
        }, 1000 * 60 * 1);
        return () => clearInterval(interval);
    }, [reloadBalances]);

    useEffect(() => {
        reloadSupplies();
        // after 2 min reload supplies
        const interval = setInterval(() => {
            reloadSupplies();
        }, 1000 * 60 * 2);
        return () => clearInterval(interval);
    }, [reloadSupplies]);

    useEffect(() => {
        reloadDecimals();
    }, [reloadDecimals]);

    useEffect(() => {
        reloadFarmData();
    }, [reloadFarmData]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />}>
                    <Route path="" element={<Dashboard />} />
                    <Route path="/farms" element={<Farms />} />
                    <Route path="/exchange" element={<Exchange />} />
                    <Route path="test" element={<Test />} />
                    <Route path="*" element={<h3 style={{ color: "white" }}>Not Found</h3>} />
                </Route>
            </Routes>
        </Router>
    );
}

export default Body;
