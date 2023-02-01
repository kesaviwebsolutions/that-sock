import "antd/dist/antd.css";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import "./App.css";
import { Contract, NetworkDisplay, Address } from "./components";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { Home } from "./views";
import { useStaticJsonRPC } from "./hooks";
import NavBar from "./components/Navbar";
import ScaffoldIcon from "./components/Icons/ScaffoldIcon";

const { ethers } = require("ethers");
/*

    Code:
    https://github.com/scaffold-eth/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Alchemy.com & Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
let initialNetwork = NETWORKS.goerli; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
let DEBUG = true;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = true; // toggle burner wallet feature
const USE_NETWORK_SELECTOR = false;

if (process.env.NODE_ENV === "production") {
  DEBUG = false;
  initialNetwork = NETWORKS.goerli;
}

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = [initialNetwork.name, "mainnet", "rinkeby"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
  const location = useLocation();

  const targetNetwork = NETWORKS[selectedNetwork];

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);

  // 🛰 providers
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  console.log(contractConfig);
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  const ContractName = "ThisSocks";

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const accesories = ["Eye", "Head", "Neck", "Perch", "Background"];
  const [selectedCollectible, setSelectedCollectible] = useState();
  const [yourCollectibleSVG, setYourCollectibleSVG] = useState();

  const [selectedAccesory, setSelectedAccesory] = useState(accesories[0]);
  const [selectedAccesoryBalance, setSelectedAccesoryBalance] = useState(accesories[0]);
  const [yourAccesories, setYourAccesories] = useState();
  const [previewAccesory, setPreviewAccesory] = useState({});
  const perPage = 10;

  // 🧠 This effect will update yourCollectibles by polling when your balance changes
  const AccesoryBalanceContract = useContractReader(readContracts, selectedAccesory, "balanceOf", [address]);

  useEffect(() => {
    if (AccesoryBalanceContract) {
      setSelectedAccesoryBalance(AccesoryBalanceContract);
    }
  }, [AccesoryBalanceContract]);

  useEffect(() => {
    const updateYourCollectibleSVG = async () => {
      try {
        console.log("Getting token index " + selectedCollectible);
        const tokenId = selectedCollectible;
        console.log("tokenId: " + tokenId);
        const svg =
          readContracts[ContractName] && tokenId && (await readContracts[ContractName].renderTokenById(tokenId));
        const newYourCollectibleSVG =
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="300" viewBox="0 0 880 880">' +
          svg +
          "</svg>";
        setYourCollectibleSVG(newYourCollectibleSVG);
      } catch (err) {
        console.log(err);
      }
    };
    if (address && selectedCollectible) {
      updateYourCollectibleSVG();
    }
  }, [address, readContracts, selectedCollectible]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="App">
      {/* <NetworkDisplay
        NETWORKCHECK={NETWORKCHECK}
        localChainId={localChainId}
        selectedChainId={selectedChainId}
        targetNetwork={targetNetwork}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
        USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
      /> */}
      <NavBar
        useBurner={USE_BURNER_WALLET}
        address={address}
        localProvider={localProvider}
        userSigner={userSigner}
        mainnetProvider={mainnetProvider}
        price={price}
        web3Modal={web3Modal}
        loadWeb3Modal={loadWeb3Modal}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
      />
      <Switch>
        <div className="App__page-content-wrapper">
          <Route exact path="/">
            {/* pass in any web3 props to this Home component. For example, yourLocalBalance */}
            <Home
              userSigner={userSigner}
              readContracts={readContracts}
              writeContracts={writeContracts}
              tx={tx}
              loadWeb3Modal={loadWeb3Modal}
              blockExplorer={blockExplorer}
              address={address}
              setSelectedCollectible={setSelectedCollectible}
              ContractName={"ThisSocks"}
              DEBUG={DEBUG}
              perPage={perPage}
              gasPrice={gasPrice}
            />
          </Route>
          <Route exact path="/contracts">
            <div style={{ padding: 32 }}>
              <Address value={readContracts && readContracts.ThisSocks && readContracts.ThisSocks.address} />
            </div>
            <Contract
              name="ThisSocks"
              price={price}
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              contractConfig={contractConfig}
            />
          </Route>
        </div>
      </Switch>
      <div className="App__footer-wrapper">
        <div className="App__footer">
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
            <ScaffoldIcon />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
