# Rust Concepts

This is an example project showcasing various concepts in Rust programming language. The project consists of multiple Rust modules:

## `main.rs`

This is the entry point of the program. It imports and calls functions from other modules to demonstrate different Rust concepts.

## `matching.rs`

This module demonstrates pattern matching in Rust. It includes the following functions:

### `matching_examples()`

This function showcases various examples of pattern matching in Rust. It matches a given number against different patterns and prints corresponding messages.

## `slice.rs`

This module demonstrates the usage of arrays and slices in Rust. It contains the following functions:

### `analyze_slice(slice: &[i32])`

This function borrows a slice of `i32` values and prints information about the slice.

### `slice_example()`

This function provides examples of working with arrays and slices in Rust. It showcases array initialization, indexing, length retrieval, memory allocation, borrowing arrays as slices, and working with array sections.

## `structs.rs`

This module showcases the usage of structs in Rust. It defines various struct types and includes the following functions:

### `struct_examples()`

This function demonstrates the creation, initialization, and usage of different struct types. It showcases struct instantiation, field access, struct update syntax, struct destructuring, and struct reuse as fields of another struct.

## `variables.rs`

This module focuses on variables in Rust. It includes the following function:

### `variables_example()`

This function demonstrates variable declaration and mutation in Rust. It showcases how to declare a variable, assign a value to it, and change its value.

---

To run the example project, execute the `main()` function in the `main.rs` module. This will call the functions from other modules to demonstrate the corresponding Rust concepts. You can do this by calling `cargo run`. Feel free to modify the values and experiment with different scenarios to deepen your understanding of Rust programming.
