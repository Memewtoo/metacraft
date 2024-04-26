import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { DiamondHands } from "../target/types/diamond_hands";
import { Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("diamond-hands", async () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.DiamondHands as Program<DiamondHands>;

  // Initialize timestamp variables for the tests
  // Convert to proper unix timestamp format (in seconds)
  let timestampDeposit = Math.floor((new Date('2024-03-29')).getTime() / 1000);
  let timestampDeposit2 = Math.floor((new Date('2024-06-01')).getTime() / 1000);

  // Generate a user1 for the transactions
  let user1 = await Keypair.generate();
  let user1Pkey = user1.publicKey;

  // Derive the PDA of the bank account using the seeds
  let bankAccount = await PublicKey.findProgramAddressSync([
        wallet.publicKey.toBuffer(), 
        wallet.publicKey.toBuffer(), 
        Buffer.from(timestampDeposit.toString())], program.programId);

  // Initialize a Deposit transaction to the program
  it("User initializes a Bank Escrow Account", async () => {
    const tx = await program.methods.createBank(new anchor.BN(timestampDeposit), new anchor.BN(25))
    .accounts({
      bank: bankAccount[0],
      sender: wallet.publicKey,
      receiver: wallet.publicKey,
    })
    .rpc()

    const confirmTx = async (tx, connection) => {
      const blockhashInfo = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: blockhashInfo.blockhash,
        lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
        signature: tx,
      });
    };

    await confirmTx(tx, connection);

    // Show bank info
    const bankInfo = await program.account.bank.fetch(bankAccount[0]);
    
    console.log("Bank sender: ", bankInfo.sender.toBase58());
    console.log("Bank receiver: ", bankInfo.receiver.toBase58());
    console.log("Bank timestamp: ", bankInfo.timestamp.toNumber());
    console.log("Bank amount: ", bankInfo.amount.toNumber());
  })

  // Another User try to withrdaw from another user Bank Account (should fail)
  it ("Failed: Another User withdraws User's Bank funds", async () => {
    try{
      const tx = await program.methods.withdrawBank(new anchor.BN(timestampDeposit))
      .accounts({
        bank: bankAccount[0],
        sender: wallet.publicKey,
        receiver: user1Pkey
      })
      .signers([user1])
      .rpc()

      // If the transaction succeeds, the test should fail
      assert.ok(false, "Another User was able to withdraw funds from User's Bank Account")
    } catch(err) {
      // If the transaction fails, the test passes
      console.log("Another User failed to withdraw funds from User's Bank Account");
      assert.ok(true);
    }
  })

  // Withdraw early ahead of the target date
  it ("Failed: User withdraw funds earlier before the target date", async () => {
    try{

      // Derive the bank address of the test transaction
      let bankAccount2 = await PublicKey.findProgramAddressSync([
        wallet.publicKey.toBuffer(), 
        wallet.publicKey.toBuffer(), 
        Buffer.from(timestampDeposit2.toString())], program.programId);
      
      // Prepare the instruction that would be executed on same transaction as the withdraw bank
      const createBankTx = await program.methods.createBank(new anchor.BN(timestampDeposit2), new anchor.BN(25))
      .accounts({
        bank: bankAccount2[0],
        sender: wallet.publicKey,
        receiver: wallet.publicKey,
      })
      .prepare()

      // Execute the withdraw Bank and the createBank instruction in one transaction
      const tx = await program.methods.withdrawBank(new anchor.BN(timestampDeposit2))
      .preInstructions([createBankTx.instruction])
      .accounts({
        bank: bankAccount2[0],
        sender: wallet.publicKey,
        receiver: wallet.publicKey
      })
      .rpc()

      // If the transaction succeeds, the test should fail
      assert.ok(false, "User was able to withdraw funds earlier from the target date")
    } catch(err) {
      // If the transaction fails, the test passes
      console.log("User failed to withdraw funds earlier from the target date");
      assert.ok(true);
    }
  })

  // User withdraw their funds on the Bank
  it ("User1 successfully withdraws his funds from the Bank Escrow Account", async () => {
    const tx = await program.methods.withdrawBank(new anchor.BN(timestampDeposit))
    .accounts({
      bank: bankAccount[0],
      sender: wallet.publicKey,
      receiver: wallet.publicKey
    })
    .rpc()

    const confirmTx = async (tx, connection) => {
      const blockhashInfo = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: blockhashInfo.blockhash,
        lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
        signature: tx,
      });
    };

    await confirmTx(tx, connection);
  })


});
