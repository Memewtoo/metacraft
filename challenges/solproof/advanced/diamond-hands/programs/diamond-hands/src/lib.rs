use anchor_lang::prelude::*;
use solana_program::{program::invoke, system_instruction::transfer};

declare_id!("Bbz4dnkiRz9oSjdg8H42KqWrhveDKTMRSB7b7HBADy3Z");

#[program]
pub mod diamond_hands {
    use super::*;

    pub fn create_bank(ctx: Context<CreateBank>, timestamp: i64, amount: u64) -> Result <()> {
        let bank = &mut ctx.accounts.bank;
        let sender = &mut ctx.accounts.sender;
        let receiver = &mut ctx.accounts.receiver;

        invoke(
            &transfer(&sender.key(), &bank.key(), amount),
            &[sender.to_account_info(), bank.to_account_info()],
        )?;

        bank.sender = sender.key();
        bank.receiver = receiver.key();
        bank.amount = amount;
        bank.timestamp = timestamp;
        bank.bump = ctx.bumps.bank;

        Ok(())
    }

    pub fn withdraw_bank(ctx: Context<WithdrawBank>, _timestamp: i64) -> Result <()> {
        let bank = &mut ctx.accounts.bank;
        let receiver = &mut ctx.accounts.receiver;

        msg!("Bank Timestamp: {}", bank.timestamp);
        msg!("Current Timestamp: {}", Clock::get().unwrap().unix_timestamp);

        if Clock::get().unwrap().unix_timestamp < bank.timestamp {
            return Err(ErrorCode::HandsTooWeak.into());
        }

        **bank
            .to_account_info()
            .try_borrow_mut_lamports()
            .unwrap() -= bank.amount;

        **receiver
            .to_account_info()
            .try_borrow_mut_lamports()
            .unwrap() += bank.amount;
        
        Ok (())
    }

}

/* Data validators */ 

#[derive(Accounts)]
#[instruction(timestamp: i64, amount: u64)]
pub struct CreateBank<'info> {
    #[account(
        init,
        seeds = [sender.key().as_ref(), receiver.key().as_ref(), timestamp.to_string().as_bytes().as_ref()],
        bump,
        payer = sender,
        space = 8 + Bank::INIT_SPACE
    )]
    pub bank: Account<'info, Bank>,

    #[account(mut)]
    pub sender: Signer<'info>,

    /// CHECK: receiver will be a wallet key passed in by user
    pub receiver: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(timestamp: i64)]
pub struct WithdrawBank<'info> {
    #[account(
        mut,
        close = sender,
        seeds = [sender.key().as_ref(), receiver.key().as_ref(), timestamp.to_string().as_bytes().as_ref()],
        bump = bank.bump
    )]
    pub bank: Account<'info, Bank>,

    /// CHECK: sender will be verified by the bank account
    #[account(
        mut,
        address = bank.sender
    )]
    pub sender: UncheckedAccount<'info>,

    #[account(
        mut,
        address = bank.receiver
    )]
    pub receiver: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/* Data Structures */

#[account]
#[derive(InitSpace)]
pub struct Bank {
    pub sender: Pubkey,
    pub receiver: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
    pub bump: u8,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    HandsTooWeak,
}
