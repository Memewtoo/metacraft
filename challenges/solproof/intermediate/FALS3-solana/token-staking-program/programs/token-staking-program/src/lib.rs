// Import necessary dependencies
use anchor_lang::prelude::*;
use solana_program::clock::Clock;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, MintTo, Token, TokenAccount, Transfer, transfer},
};

// Declare the program ID
declare_id!("5sY87vVyucdBLSsQkFWMranjJ57jDoWVNuRV4yrdgu5m");

// Define constant seeds for the stake-program account derivations
pub mod constants {
    pub const VAULT_SEED: &[u8] = b"vault";
    pub const STAKE_INFO_SEED: &[u8] = b"stake_info";
    pub const TOKEN_SEED: &[u8] = b"token";
}

// Define the main program module
#[program]
pub mod token_staking_program {
    use super::*;
    
    pub fn initialize_vault(_ctx: Context<InitializeVault>) -> Result <()> {
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result <()> {
        let stake_info = &mut ctx.accounts.stake_info_account;

        if stake_info.is_staked {
            return Err(ErrorCode::IsStaked.into());
        }

        if amount <= 0 {
            return Err(ErrorCode::NoTokens.into());
        }

        let clock = Clock::get()?;

        stake_info.stake_at_slot = clock.slot;
        stake_info.is_staked = true;

        let stake_amount = (amount)
            .checked_mul(10u64.pow(ctx.accounts.mint.decimals as u32))
            .unwrap();
        
        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.associated_user_token_account.to_account_info(),
                    to: ctx.accounts.stake_account.to_account_info(),
                    authority: ctx.accounts.signer.to_account_info()
                }
            ),
            stake_amount,
        )?;

        Ok (())
    }

    pub fn destake(ctx: Context<Destake>) -> Result <()> {
        let stake_info = &mut ctx.accounts.stake_info_account;

        if !stake_info.is_staked {
            return Err(ErrorCode::NotStaked.into());
        }

        let clock = Clock::get()?;
        let slots_passed = clock.slot - stake_info.stake_at_slot;

        let stake_amount = ctx.accounts.stake_account.amount;

        let reward = (slots_passed as u64)
            .checked_mul(10u64.pow(ctx.accounts.mint.decimals as u32))
            .unwrap();
        
        let bump = ctx.bumps.token_vault_account;
        let signer: &[&[&[u8]]] = &[&[constants::VAULT_SEED, &[bump]]];

        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.token_vault_account.to_account_info(),
                    to: ctx.accounts.associated_user_token_account.to_account_info(),
                    authority: ctx.accounts.token_vault_account.to_account_info(),
                },
                signer
            ),
            reward
        )?;

        let staker = ctx.accounts.signer.key();
        let bump = ctx.bumps.stake_account;
        
        let signer: &[&[&[u8]]] = &[&[constants::TOKEN_SEED, &staker.as_ref(), &[bump]]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.stake_account.to_account_info(),
                    to: ctx.accounts.associated_user_token_account.to_account_info(),
                    authority: ctx.accounts.stake_account.to_account_info(),
                },
                signer
            ),
            stake_amount
        )?;

        stake_info.is_staked = false;
        stake_info.stake_at_slot = clock.slot;

        Ok (())
    }

    pub fn initialize_mint(ctx: Context<InitializeMint>, _decimals: u8) -> Result<()> {
        msg!("Token mint initialized: {}", ctx.accounts.token_mint.key());
        Ok(())
    }

    pub fn initialize_associated_token_account(ctx: Context<InitializeATA>) -> Result <()> {
        msg!("Associated Token Account Initialized: {}", ctx.accounts.associated_token.key());
     
        Ok(())
    }

    pub fn airdrop(ctx: Context <Airdrop>, amount: u64) -> Result<()> {
        // anchor saves the bump it calculated, you can access them via their associated account name
        let mint_bump = ctx.bumps.mint_authority;

        // seeds and bumps
        let mint_seeds = &["mint-authority".as_bytes(), &[mint_bump]];
        let signer = &[&mint_seeds[..]];

        //convert amount to proper decimal format of the minted token
        let airdrop_amount = (amount)
            .checked_mul(10u64.pow(ctx.accounts.token_mint.decimals as u32))
            .unwrap();

        msg!("Airdropping {} tokens.....", airdrop_amount);
        let mint_to_ctx = ctx.accounts.mint_to_ctx().with_signer(signer);
        token::mint_to(mint_to_ctx, airdrop_amount)?;

        msg!("Airdrop complete!");

        Ok (())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [constants::VAULT_SEED],
        bump,
        payer = signer,
        token::mint = mint,
        token::authority = token_vault_account,
    )]
    pub token_vault_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info>{
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [constants::STAKE_INFO_SEED, signer.key.as_ref()],
        bump,
        payer = signer,
        space = 8 + std::mem::size_of::<StakeInfo>()
    )]
    pub stake_info_account: Account<'info, StakeInfo>, 

    #[account(
        init_if_needed,
        seeds = [constants::TOKEN_SEED, signer.key.as_ref()],
        bump,
        payer = signer,
        token::mint = mint,
        token::authority = stake_account
    )]
    pub stake_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub associated_user_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct Destake <'info>{
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [constants::STAKE_INFO_SEED, signer.key.as_ref()],
        bump,
    )]
    pub stake_info_account: Account<'info, StakeInfo>,

    #[account(
        mut,
        seeds = [constants::TOKEN_SEED, signer.key.as_ref()],
        bump,
    )]
    pub stake_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [constants::VAULT_SEED],
        bump,
    )]
    pub token_vault_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub associated_user_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
pub struct StakeInfo {
    pub stake_at_slot: u64,
    pub is_staked: bool,
}

#[derive(Accounts)]
#[instruction(decimals: u8)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        mint::authority = mint_authority,
        mint::decimals = decimals,
        seeds = ["token-mint".as_bytes()],
        bump,
        payer = payer
    )]
    pub token_mint: Account<'info, Mint>,

    /// CHECK: using as a Signer
    #[account(
        seeds = ["mint-authority".as_bytes()],
        bump,
    )]
    pub mint_authority: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct InitializeATA<'info>{
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
    )]
    pub associated_token: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Airdrop<'info> {
    #[account(
        mut,
        seeds = ["token-mint".as_bytes()],
        bump,
    )]
    pub token_mint: Account<'info, Mint>,

    /// CHECK: Using as a signer
    #[account(
        mut,
        seeds = ["mint-authority".as_bytes()],
        bump,
    )]
    pub mint_authority: AccountInfo<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub associated_token: Account<'info, TokenAccount>,

    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

impl <'info> Airdrop <'info> {
    pub fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>>{
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = MintTo{
            mint: self.token_mint.to_account_info(),
            to: self.associated_token.to_account_info(),
            authority: self.mint_authority.to_account_info()
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

// Define error codes for the program
#[error_code]
pub enum ErrorCode {
    #[msg("Tokens are already staked")]
    IsStaked,

    #[msg("Tokens are not staked")]
    NotStaked,

    #[msg("No Tokens to stake")]
    NoTokens,
}