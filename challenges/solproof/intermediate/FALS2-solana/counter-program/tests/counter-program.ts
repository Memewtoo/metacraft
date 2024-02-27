import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CounterProgram } from "../target/types/counter_program";
import { Keypair, SystemProgram } from "@solana/web3.js"

describe("counter-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.AnchorProvider.env();
  const program = anchor.workspace.CounterProgram as Program<CounterProgram>;

  //Create counter keypair
  let counter = Keypair.generate();

  //#Tests
  
  it("Creates Counter account!", async () => {
    const tx = await program.methods.create().accounts({
      counter: counter.publicKey,
      authority: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId
    })
    .signers([counter])
    .rpc()
    console.log("Your transaction signature", tx);

    //Checks the existence of the Counter Account
    const counterAccount = await program.account.counter.fetch(counter.publicKey);
    console.log("Counter Account:", counterAccount.count);
  });


  it ("Increments counter account", async () => {
    const tx = await program.methods.increment().accounts({
      counter: counter.publicKey,
      authority: provider.wallet.publicKey
    })
    .rpc()

    console.log("Your transaction signature", tx);

    //Check the increment of count in CounterAccount
    const counterAccount = await program.account.counter.fetch(counter.publicKey);
    console.log("Counter Account:", counterAccount.count);

  });

  it ("Decrements counter account", async () => {
    const tx = await program.methods.decrement().accounts({
      counter: counter.publicKey,
      authority: provider.wallet.publicKey
    })
    .rpc()

    console.log("Your transaction signature", tx);

    //Check the decrement of count in CounterAccount
    const counterAccount = await program.account.counter.fetch(counter.publicKey);
    console.log("Counter Account:", counterAccount.count);
  })
});
