import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import * as buffer from "buffer";
import "./App.css";
import { 
  Connection,
  PublicKey, 
  Transaction, 
  clusterApiUrl, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Keypair } from "@solana/web3.js";

window.Buffer = buffer.Buffer;

const DisplayEncoding = ["utf8", "hex"];

const PhantomEvent = ["disconnect", "connect", "accountChanged"];
const PhantomRequestMethod = [
  "connect",
  "disconnect",
  "signTransaction",
  "signAllTransactions",
  "signMessage"
];

const ConnectOpts = {
  onlyIfTrusted: false
};

const PhantomProvider = {
  publicKey: null,
  isConnected: null,
  signTransaction: (transaction) => {
    return Promise.resolve(transaction);
  },
  signAllTransactions: (transactions) => {
    return Promise.resolve(transactions);
  },
  signMessage: (message, display) => {
    return Promise.resolve(message);
  },
  connect: (opts) => {
    return Promise.resolve({ publicKey: PhantomProvider.publicKey });
  },
  disconnect: () => {
    return Promise.resolve();
  },
  on: (event, handler) => {},
  request: (method, params) => {
    return Promise.resolve();
  }
};

//Check if Solana is present in the webpage and checks if the provider is Phantom
const getProvider = () => {
  if ("solana" in window) {
    const provider = window.solana;
    if (provider.isPhantom) return provider;
  }
};

function App() {
  //State variables and their setState methods
  const [provider, setProvider] = useState(undefined);
  const [walletKey, setWalletKey] = useState(undefined);
  const [walletBalance, setWalletBalance] = useState(undefined);
  const [solanaKey, setSolKey] = useState(Keypair.generate().secretKey);
  const [solPubKey, setSolPubKey] = useState(undefined);
  const [solBalance, setSolBalance] = useState(undefined);

  //For re-rendering
  useEffect(() => {
    const provider = getProvider();
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  /** Create a Solana Account */
  const createSolAcc = async () => {
    //Connect to the devnet
    const connection = new Connection(clusterApiUrl("devnet"),"confirmed");

    //Creates a newly generated account with keypairs
    const solWallet = Keypair.generate();

    //Stores the generated keypairs to a state variable using their own setState methods
    setSolKey(solWallet.secretKey);
    setSolPubKey(solWallet.publicKey);

    //Get balance and store in state variable so that it can be reference on HTML section
    const balance = await connection.getBalance(solWallet.publicKey);
    setSolBalance(balance / LAMPORTS_PER_SOL);
  };

  //Airdrops 2 SOL to the generated account
  const airdropSOL = async () => {
    //Connect to the devnet
    const connection = new Connection(clusterApiUrl("devnet"),"confirmed");

    //Create an instance of the wallet from the keypair stored in state variable
    const solKey = Keypair.fromSecretKey(solanaKey);

    //Perform 2 airdrops of 2 SOL to the generated account
    try{
      let latestBlockHash = await connection.getLatestBlockhash();

      const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(solKey.publicKey), 2 * LAMPORTS_PER_SOL);

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
      });

      //Get balance and store in state variable so that it can be reference on HTML section
      const balance = await connection.getBalance(solKey.publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);

      console.log(balance / LAMPORTS_PER_SOL);
      console.log(fromAirDropSignature);

    } catch(err) {
      console.log(err);
    }
  }

  //Executes the airdropSOL function with a delay
  const performAirDrop = async () => {
    setTimeout(await airdropSOL(), 10000);
  }

  /** Transfer 2 SOL from newly created Solana account to Wallet Account */
  const transferSol = async () => {
    //Connect to the devnet
    const connection = new Connection(clusterApiUrl("devnet"),"confirmed");

    //Create an instance of the wallet from the keypair stored in state variable
    const solKey = Keypair.fromSecretKey(solanaKey);

    //Perform the transaction of transferring 2 SOL from the generated wallet to connected wallet
    try{
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: solKey.publicKey,
          toPubkey: walletKey,
          lamports: 2 * LAMPORTS_PER_SOL
        })
      );
  
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [solKey]
      );

    console.log('Signature is ', signature);
    } catch(err){
      console.log(err);
    }

    //Get the balance of the generated wallet and the connected wallet
    const solBalance = await connection.getBalance(solKey.publicKey);
    const balance = await connection.getBalance(new PublicKey(walletKey));

    setSolBalance(solBalance / LAMPORTS_PER_SOL);
    setWalletBalance(balance / LAMPORTS_PER_SOL);
  }

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      try {
        const response = await solana.connect();
        const connection = new Connection(clusterApiUrl("devnet", "confirmed"));

        const balance = await connection.getBalance(response.publicKey);

        console.log("wallet account ", response.publicKey.toString());
        setWalletKey(response.publicKey.toString());
        setWalletBalance(balance / LAMPORTS_PER_SOL);
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  const disconnectWallet = async () => {
    const { solana } = window;
    try {
      await solana.disconnect();
      setWalletKey(undefined);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Solana Project 1</h2>
        {!solPubKey &&(
        <div>
          <button
                style={{
                  fontSize: "16px",
                  padding: "15px",
                  fontWeight: "bold",
                  borderRadius: "5px",
                }}
                onClick={createSolAcc}
              >
                Create a new Solana Account
            </button>
        </div>)}

        {solPubKey &&(
          <div>
            <p>— Solana Account —</p>
            <p>Solana Account: {`${solPubKey}`}</p>
            <p>Solana Balance: {`${solBalance}`}</p>
            <button
                style={{
                  fontSize: "16px",
                  padding: "15px",
                  fontWeight: "bold",
                  borderRadius: "5px",
                }}
                onClick={performAirDrop}
              >
                Airdrop 2 SOL
            </button>
          </div>
        )}

        {provider && walletKey && (
          <div>
            <button
              className="App-button"
              style={{
                fontSize: "16px",
                padding: "15px",
                fontWeight: "bold",
                borderRadius: "5px",
                float: "right",
              }}
              onClick={disconnectWallet}
            >
              Disconnect Wallet
            </button>

            <p>— Connected account —</p>
            <p>Wallet Address: {`${walletKey}`}</p>
            <p>Balance : {`${walletBalance}`}</p>

            <button
              style={{
                fontSize: "16px",
                padding: "15px",
                fontWeight: "bold",
                borderRadius: "5px",
              }}
              onClick={transferSol}
            >
              Transfer SOL
            </button>
          </div>
        )}

        {provider && !walletKey && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
              margin: "15px"
              
            }}
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}

        {!provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )} 
        </header>
    </div>
  );
}

export default App;
