/** Import readline module for inputting from console */
const readline = require("readline");

/** Import Solana web3 functionalities */
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL
} = require("@solana/web3.js");

/** Create a readline interface */
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Create a new keypair
const newPair = new Keypair();

// Exact the public and private key from the keypair
const publicKey = new PublicKey(newPair._keypair.publicKey).toString();
const privateKey = newPair._keypair.secretKey;

// Connect to the Devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

console.log("Public Key of the generated keypair", publicKey);

// Get the wallet balance from a given private key
const getWalletBalance = async () => {
    try {
        // Connect to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        // console.log("Connection object is:", connection);

        // Make a wallet (keypair) from privateKey and get its balance
        const myWallet = await Keypair.fromSecretKey(privateKey);
        const walletBalance = await connection.getBalance(
            new PublicKey(newPair.publicKey)
        );
        console.log(`Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
    } catch (err) {
        console.log(err);
    }
};

/** Put some SOL to the user inputted public address through airdropping */
const airDropSol = async () => {
    try {
        // Connect to the Devnet and make a wallet from privateKey
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        //Prompt the user to input the public address of the wallet of their choice to aidrop some SOL
        rl.question("Public Key: ", async function (pubkey) {
            console.log(`Connected to wallet: ${pubkey}`);
            rl.close();

            console.log("Airdropping some SOL to my wallet!");

             // Request airdrop of 2 SOL to the wallet
            const fromAirDropSignature = await connection.requestAirdrop(
                new PublicKey(pubkey),
                2 * LAMPORTS_PER_SOL
            );

            await connection.confirmTransaction(fromAirDropSignature);
            await getWalletBalance();
        });
        
    } catch (err) {
        console.log(err);
    }
};

// Show the wallet balance before and after airdropping SOL
const mainFunction = async () => {
    await getWalletBalance();
    await airDropSol();
}

mainFunction();
