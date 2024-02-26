use std::io::{self, Read};
use std::convert::TryInto;
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct MathAccount {
    /// result of sum operation
    pub sum_result: u32,

    /// result of difference operation
    pub diff_result: i32, // Changed to i32 to allow for negative differences
}

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Function to calculate the sum of two numbers
fn calculate_sum(a: u32, b: u32) -> u32 {
    a + b
}

// Function to calculate the difference of two numbers
fn calculate_difference(a: u32, b: u32) -> i32 {
    (a as i32) - (b as i32)
}

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the program was loaded into
    accounts: &[AccountInfo], // The accounts to perform operations on
    instruction_data: &[u8], // Input data for instructions
) -> ProgramResult {
    msg!("Math Operations Rust program entrypoint");

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to store results
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("Math account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Print length of instruction_data
    msg!("Instruction Data Length: {}", instruction_data.len());

    // Deserialize the MathAccount state from the account data
    let mut math_account = MathAccount::try_from_slice(&account.data.borrow())?;

    // Print deserialized MathAccount before modification
    msg!("Deserialized MathAccount Before: {:?}", math_account);

    let user_choice = u32::from_le_bytes(instruction_data[0..4].try_into().unwrap());

    // Ensure that user_choice is either 1 or 2
    if user_choice != 1 && user_choice != 2 {
        msg!("Invalid choice. Please choose 1 for sum or 2 for difference.");
        return Err(ProgramError::InvalidArgument);
    }

    //Get numerical values from the 2nd and 3rd index of instruction data
    let a = u32::from_le_bytes(instruction_data[4..8].try_into().unwrap());
    let b = u32::from_le_bytes(instruction_data[8..12].try_into().unwrap());

    // Call the corresponding function based on user's choice
    match user_choice {
        1 => {
            // User chose to calculate the sum
            math_account.sum_result = calculate_sum(a, b);
            msg!("Sum: {}", math_account.sum_result);
        }
        2 => {
            // User chose to calculate the difference
            math_account.diff_result = calculate_difference(a, b);
            msg!("Difference: {}", math_account.diff_result);
        }
        _ => {
            msg!("Invalid choice. Please choose 1 for sum or 2 for difference.");
            return Err(ProgramError::InvalidArgument);
        }
    }

    // Serialize the updated MathAccount state back to the account data
    let serialized_data = math_account.try_to_vec()?;
   
    // Check the length of the serialized data
    let expected_size = std::mem::size_of::<MathAccount>();
    if serialized_data.len() != expected_size {
        msg!("Unexpected length of serialized_data: {}", serialized_data.len());
        return Err(ProgramError::InvalidArgument);
    }

    // Copy the serialized data into the account
    account.data.borrow_mut().copy_from_slice(&serialized_data);

    Ok(())
}

//Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use std::mem;
    use solana_program::clock::Epoch;

    #[test]
    fn test_sanity() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<MathAccount>()]; // Use MathAccount size
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );
    
        // Populate instruction_data with some values (1 for sum or 2 for difference)
        let instruction_data: Vec<u8> = vec![1,0,0,0,12,0,0,0,4,0,0,0];

        let user_choice = u32::from_le_bytes(instruction_data[0..4].try_into().unwrap());
    
        let accounts = vec![account];
    
        // Deserialize MathAccount from the account's data
        let math_account_before = MathAccount::try_from_slice(&accounts[0].data.borrow());
    
        // Check if deserialization is successful
        match math_account_before {
            Ok(math_account_before) => {
                // Check initial values
                assert_eq!(math_account_before.sum_result, 0);
                assert_eq!(math_account_before.diff_result, 0);

                // Set the expected sum and difference results
                let expected_sum_result = 16; // Sum of 12 and 4
                let expected_diff_result = 8; // Difference of 12 and 4

                // Print initial state
                println!("Initial MathAccount: {:?}", math_account_before);
                println!("Instruction Data: {:?}", instruction_data);

                // Run the instruction to perform a math operation
                process_instruction(&program_id, &accounts, &instruction_data).unwrap();

                // Deserialize MathAccount after the instruction
                match MathAccount::try_from_slice(&accounts[0].data.borrow()) {
                    Ok(math_account_after) => {
                        // Print final state
                        println!("Final MathAccount: {:?}", math_account_after);
                
                        // Check the updated values
                        if user_choice == 1 {
                            assert_eq!(math_account_after.sum_result, expected_sum_result);
                            assert_eq!(math_account_after.diff_result, 0); // For sum, diff_result should remain 0
                        } else if user_choice == 2 {
                            assert_eq!(math_account_after.sum_result, 0); // For diff, sum_result should remain 0
                            assert_eq!(math_account_after.diff_result, expected_diff_result);
                        } else {
                            // Handle invalid user_choice
                            panic!("Invalid user choice");
                        }
                    }
                    Err(err) => {
                        // Handle the case where deserialization after the instruction fails
                        panic!("Failed to deserialize MathAccount after instruction: {:?}", err);
                    }
                }
            }
            Err(err) => {
                // Handle the case where deserialization before the instruction fails
                panic!("Failed to deserialize MathAccount before instruction: {:?}", err);
            }
        }
    }
}