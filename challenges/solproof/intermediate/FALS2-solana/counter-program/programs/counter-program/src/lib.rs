use anchor_lang::prelude::*;

declare_id!("9sXVUyNAkHBAMVrFoZvmdspMFPG6oXwzZm81QhsFRW7s");

#[program]
pub mod counter_program {
    use super::*;

    pub fn create(ctx: Context<Create>) -> Result<()> {
        ctx.accounts.counter.authority = ctx.accounts.authority.key();
        ctx.accounts.counter.count = 0;

        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.count += 1;
        Ok(())
    }

    pub fn decrement(ctx: Context<Decrement>) -> Result<()> {
        ctx.accounts.counter.count -= 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer = authority, space = 8 + 40)]
    pub counter: Account<'info, Counter>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, has_one = authority)]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Decrement<'info> {
    #[account(mut, has_one = authority)]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Counter {
    pub authority: Pubkey,
    pub count: u64,
}





