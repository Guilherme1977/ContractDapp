import { useEffect, useState } from 'react';
import {
  apyPool,
  calculateFarmAPY,
  calculateFeeAPY,
  findCompoundAPY,
} from '../../Compound/compound-item/compound-functions';
import { priceOfToken, totalVault, userVaultTokens } from './vault-functions';
import './VaultItem.css';

function VaultItem({
  lightMode,
  currentWallet,
  vault
}: any) {
  const [tokenAmount, setTokenAmount] = useState(0);
  const [price, setPrice] = useState(0);

  const [vaultAmount, setVaultAmount] = useState(0);
  const [feeAPY, setFeeAPY] = useState(0);

  const [rewardAPY, setRewardApy] = useState(0);
  const [apyVisionCompound, setAPYVisionCompound] = useState(0);
  const [compoundAPY, setCompoundAPY] = useState(0);

  useEffect(() => {
    userVaultTokens(
      currentWallet,
      vault.vault_address,
      vault.vault_abi,
      setTokenAmount
    );
    priceOfToken(vault.lp_address, setPrice);

    totalVault(vault.vault_address, vault.vault_abi, setVaultAmount);

    apyPool(vault.lp_address, setRewardApy);
    calculateFeeAPY(vault.lp_address, setFeeAPY);

    calculateFarmAPY(rewardAPY, feeAPY, setAPYVisionCompound);
    findCompoundAPY(vault.apy, setCompoundAPY);
  }, [currentWallet, vault, tokenAmount, price, rewardAPY, feeAPY]);


  return (
    <div>
      {tokenAmount * price < 0.01 ? null : (
        <div className={`vault_item ${lightMode && 'vault_item--light'}`}>
          <div className={`vault_item_images`}>
            {vault.alt1 ? (
              <img
                className={`vault_item_logo1`}
                alt={vault.alt1}
                src={vault.logo1}
              />
            ) : null}

            {vault.alt2 ? (
              <img
                className={`vault_item_logo2`}
                alt={vault.alt2}
                src={vault.logo2}
              />
            ) : null}

            <p className={`vault_item_name`}>{vault.name}</p>
          </div>

          <div className={`vault_items_bottom_header`}>
            <div className={`vault_items_bottom_row`}>
              <div className={`vault_items_bottom_categories`}>
                <p
                  className={`vault_items_title ${
                    lightMode && 'vault_items_title--light'
                  }`}
                >
                  Liquidity
                </p>
                <p>
                  {(vaultAmount * price).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>
              </div>

              <div className={`vault_items_bottom_categories`}>
                <p
                  className={`vault_items_title ${
                    lightMode && 'vault_items_title--light'
                  }`}
                >
                  Pool Share
                </p>
                <p>{((tokenAmount / vaultAmount) * 100).toFixed(2)}%</p>
              </div>
            </div>

            <div className={`vault_items_bottom_row`}>
              <div className={`vault_items_bottom_categories`}>
                <p
                  className={`vault_items_title ${
                    lightMode && 'vault_items_title--light'
                  }`}
                >
                  APY
                </p>
                {!vault.apy ? (
                  <p> {(apyVisionCompound + rewardAPY + feeAPY).toFixed(2)}%</p>
                ) : (
                  <p> {(compoundAPY + Number(vault.apy)).toFixed(2)}%</p>
                )}
              </div>

              <div className={`vault_items_bottom_categories`}>
                <p
                  className={`vault_items_title ${
                    lightMode && 'vault_items_title--light'
                  }`}
                >
                  Your Stake
                </p>
                <p>
                  {(tokenAmount * price).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VaultItem;