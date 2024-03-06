import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TokenStakingProgram } from "../target/types/token_staking_program";
import { Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createRecoverNestedInstruction, getAccount, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { assert } from "chai";

describe("token-staking-program", async () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const connection = provider.connection;
  const program = anchor.workspace.TokenStakingProgram as Program<TokenStakingProgram>;
  const wallet = provider.wallet as anchor.Wallet;

  // Derive PDA of the token mint and mint authority using the seeds 
  let tokenMint = await PublicKey.findProgramAddressSync([Buffer.from("token-mint")], program.programId)
  const mintAuthority = await PublicKey.findProgramAddressSync([Buffer.from("mint-authority")], program.programId)
  console.log("Token mint pda: ", tokenMint[0].toBase58())
	console.log("Mint auth pda: ", mintAuthority[0].toBase58())

  // Derive PDA of the vault account using the seeds
  let [vaultAccount] = PublicKey.findProgramAddressSync([Buffer.from("vault")], program.programId)

  // Generate a random user keypair for transactions
  let userTokenAccount = await Keypair.generate()
  let userTokenAccountPkey = userTokenAccount.publicKey;

  // Derive associated token account address
  const associatedTokenAddress = getAssociatedTokenAddressSync(
    tokenMint[0],
    userTokenAccountPkey
  );

  // Airdrops 2 sol to user
  it("Airdrops 2 SOL to user account", async () =>{
    const tx = await connection.requestAirdrop(userTokenAccountPkey, 2 * LAMPORTS_PER_SOL);
    
    console.log("Transaction: ",tx);
  })
  
  // Creates a customized mint program
  it("Create Mint", async () => {
    const tx = await program.methods.initializeMint(10)
    .accounts({
      tokenMint: tokenMint[0],
      mintAuthority: mintAuthority[0],
      payer: provider.wallet.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    })
    .rpc()
    console.log("Initialize mint tx:", tx);
  })

  // Creates a token vault
  it("Creates a Token Vault", async () => {
    const tx = await program.methods.initializeVault()
    .accounts({
      signer: wallet.publicKey,
      tokenVaultAccount: vaultAccount,
      mint: tokenMint[0],
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    })
    .rpc()

    console.log("Initialize Token Vault tx: ", tx);
  })

  it("Creates a User Associated Token Account", async () => {
    // Check if the user token account is already initialized
  const userTokenAccountInfo = await program.provider.connection.getAccountInfo(
    userTokenAccountPkey
  );
  
  if (!userTokenAccountInfo || userTokenAccountInfo.data.length === 0) {

    // User token account is not initialized, proceed with initialization
    const tx = await program.methods.initializeAssociatedTokenAccount()
      .accounts({
        signer: userTokenAccountPkey,
        associatedToken: associatedTokenAddress,
        mint: tokenMint[0],
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([userTokenAccount])
      .rpc();
    console.log("Initialize user token account tx: ", tx);

    const tokenAccount = await getAccount(connection, associatedTokenAddress);
    assert(tokenAccount.mint.toBase58() == tokenMint[0].toBase58());
    assert(tokenAccount.owner.toBase58() == userTokenAccountPkey.toBase58());
  } else {
    console.log("User token account is already initialized");
  }
  })

  it("Airdrop tokens", async () => {
    // Get the associated token account of the user wallet
    const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      userTokenAccount,
      tokenMint[0],
      userTokenAccountPkey
    )

    const tx = await program.methods.airdrop(new anchor.BN(12))
    .accounts({
      tokenMint: tokenMint[0],
      mintAuthority: mintAuthority[0],
      user: provider.wallet.publicKey,
      associatedToken: associatedTokenAccount.address,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,

    })
    .signers([])
    .rpc()
    console.log("Airdrop tx:", tx)
  })

  it("Airdropping more tokens", async () => {
    // Get the associated token account of the user wallet
    const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      userTokenAccount,
      tokenMint[0],
      userTokenAccountPkey
    )
  
    const tx = await program.methods.airdrop(new anchor.BN(25))
    .accounts({
      tokenMint: tokenMint[0],
      mintAuthority: mintAuthority[0],
      user: provider.wallet.publicKey,
      associatedToken: associatedTokenAccount.address,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .signers([])
    .rpc()
    console.log("Airdrop tx:", tx)
  })

  it("Airdrops 500 Tokens to Vault", async () => {
    // Get the associated token account of the user wallet
    const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      userTokenAccount,
      tokenMint[0],
      userTokenAccountPkey
    )

    const tx = await program.methods.airdrop(new anchor.BN(500))
    .accounts({
      tokenMint: tokenMint[0],
      mintAuthority: mintAuthority[0],
      user: provider.wallet.publicKey,
      associatedToken: vaultAccount,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .signers([])
    .rpc()

    let user_balance = await connection.getTokenAccountBalance(associatedTokenAccount.address);
    let vault_balance = await connection.getTokenAccountBalance(vaultAccount);

    console.log("User Token Balance: ", parseInt(user_balance.value.amount) / 1e10);
    console.log("Vault Token Balance: ", parseInt(vault_balance.value.amount) / 1e10);

    console.log("Airdrop tx:", tx)
  })

  it("Stakes token", async () => {
    let associateduserTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      userTokenAccount,
      tokenMint[0],
      userTokenAccountPkey
    );

    let [stakeInfo] = PublicKey.findProgramAddressSync(
      [Buffer.from("stake_info"), 
      userTokenAccountPkey.toBuffer()], 
      program.programId
    );

    let [stakeAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("token"), 
      userTokenAccountPkey.toBuffer()], 
      program.programId
    );

    const tx = await program.methods
    .stake(new anchor.BN(1))
    .accounts({
      stakeInfoAccount: stakeInfo,
      stakeAccount: stakeAccount,
      associatedUserTokenAccount: associateduserTokenAccount.address,
      mint: tokenMint[0],
      signer: userTokenAccountPkey
    })
    .signers([userTokenAccount])
    .rpc();

    let user_balance = await connection.getTokenAccountBalance(associateduserTokenAccount.address);
    let stake_account_balance = await connection.getTokenAccountBalance(stakeAccount);

    console.log("User Token Balance: ", parseInt(user_balance.value.amount) / 1e10);
    console.log("Stake Account Balance: ", parseInt(stake_account_balance.value.amount) / 1e10);

    console.log("Transaction: ", tx);

  })

  it("Destakes", async () => {

    let associateduserTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      userTokenAccount,
      tokenMint[0],
      userTokenAccountPkey
    );

    let [stakeInfo] = PublicKey.findProgramAddressSync(
      [Buffer.from("stake_info"), 
      userTokenAccountPkey.toBuffer()], 
      program.programId
    );

    let [stakeAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("token"), 
      userTokenAccountPkey.toBuffer()], 
      program.programId
    );

    const tx = await program.methods
    .destake()
    .accounts({
      stakeAccount: stakeAccount,
      stakeInfoAccount: stakeInfo,
      associatedUserTokenAccount: associateduserTokenAccount.address,
      tokenVaultAccount: vaultAccount,
      signer: userTokenAccountPkey,
      mint: tokenMint[0],
    })
    .signers([userTokenAccount])
    .rpc();

    let user_balance = await connection.getTokenAccountBalance(associateduserTokenAccount.address);
    let stake_account_balance = await connection.getTokenAccountBalance(stakeAccount);
    let vault_balance = await connection.getTokenAccountBalance(vaultAccount);
    
    console.log("User Token Balance: ", parseInt(user_balance.value.amount) / 1e10);
    console.log("Stake Account Balance: ", parseInt(stake_account_balance.value.amount) / 1e10);
    console.log("Vault Token Balance: ", parseInt(vault_balance.value.amount) / 1e10);

    console.log("Transaction: ", tx);
  })

})

