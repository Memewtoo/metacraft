
//---------------------------------------------------------------------

//use of stdin/stdout library to read and write datas to the program
use std::io::{stdin, stdout, Write};

fn read(input: &mut String) {
    stdout().flush()
        .expect("Failed to flush");
    stdin().read_line(input)
        .expect("Failed to read");
}

fn main() {
    println!("------------------ SIMPLE RUST CALCULATOR -------------------");
    loop {
        //Variables that will hold the values
        let mut num1 = String::new();
        let mut num2 = String::new();

        //Variable that holds the operator
        let mut operator: String;

        //Variable that holds the result value
        let result: f32;

        //Initiate user to input for values
        print!("First number: ");
        read(&mut num1);

        print!("Second number: ");
        read(&mut num2);

        //Will loop if user inputted invalid operation
        loop{
            operator = String::new();

            //Initiate user to input an operator
            print!("What operation would you like to use? (+ - * /): ");
            read(&mut operator);

            //Perform the operation and store it in result variable, otherwise it's an invalid operator
            result = match operator.trim(){
                "+" => num1.trim().parse::<f32>().unwrap() + num2.trim().parse::<f32>().unwrap(),
                "-" => num1.trim().parse::<f32>().unwrap() - num2.trim().parse::<f32>().unwrap(),
                "*" => num1.trim().parse::<f32>().unwrap() * num2.trim().parse::<f32>().unwrap(),
                "/" => num1.trim().parse::<f32>().unwrap() / num2.trim().parse::<f32>().unwrap(),
                _ => {println!("Invalid operator, try again."); continue;}
            };
            
            break;
        }

        println!("");
        println!("=============================================================");
        println!("   {} {} {} = {}",num1.trim(), operator.trim(), num2.trim(), result);
        println!("");

        //Let user decide if they want to still continue using the program.
        let mut cont = String::new();

        print!("Enter any key to continue, enter n to exit: ");
        read(&mut cont);

        let cont: char = cont.trim().chars().next().unwrap();

        match cont{
            'n' => break,
            _ => {println!(""); continue;}
        };
    }
    
}
