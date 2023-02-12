// Import Solana web3 functionalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

/** Secret key from a sender wallet */
const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        61, 230, 159,  43, 101, 181,  59,  48, 227, 104,  49,
      176, 240, 146, 211, 162, 112,  22, 179,  99,  34, 243,
       24, 164, 119,   7, 179, 211,  74, 154,  32, 184, 170,
       97, 143,   1, 125,  34, 167,  61,  24, 168, 218, 229,
      249, 255, 182, 124,  34, 158, 219, 181,  29, 146, 188,
      235, 245, 178,  86, 251, 170, 227, 210,  19

      ]            
);

// Generate another Keypair (account we'll be sending to)
const to = Keypair.generate();

const getBalance = async() => {
    try{
        //Connect to DevNet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        //Make instance of both wallets
        const fromWallet = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
        const toWallet = Keypair.fromSecretKey(to.secretKey);

        //Get balance of both wallet;
        const fromBalance = await connection.getBalance(new PublicKey(fromWallet.publicKey));
        const toBalance = await connection.getBalance(new PublicKey(toWallet.publicKey));

        //Display both wallet balance
        console.log(`From (Wallet) Balance: ${parseInt(fromBalance) / LAMPORTS_PER_SOL} SOL`);
        console.log(`To (Wallet) Balance: ${parseInt(toBalance) / LAMPORTS_PER_SOL} SOL`);
    } catch (err){
        console.log(err);
    }
    
};

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    const from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    const fromBalance = await connection.getBalance(new PublicKey(from.publicKey));

    await getBalance();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    await getBalance();

    //Get half the amount of the current balance
    const halfBalance = parseInt(fromBalance / 2);

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: halfBalance
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    
    await getBalance();
    console.log('Signature is ', signature);
}

transferSol();
