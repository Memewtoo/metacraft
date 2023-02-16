# Key Differences
- Both transaction have data that desribes how the transaction goes atomically, failed transaction has `Result : Error`, while the successful transaction has `Result : Success`.
- Failed transactions has additional information called `Error` which tell how the transaction failed, in this case it is `Program Error: "Instruction #1 Failed"`.
- Observing the instructions part below the transaction, I can surmise that that the failed transaction fails because it two different data on slots portion,
inferring from the successful transaction that it should have been only 1.
