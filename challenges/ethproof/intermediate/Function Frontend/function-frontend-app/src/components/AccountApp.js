import React, { Component } from 'react';
import web3 from "../web3";
import account from "../account";
import { ethers } from "ethers";

class AccountApp extends Component {
    state = {
        value: "",
        balance: "",
        contributors: ""
    };

    // async componentDidMount() {
    //     const contributors = await account.methods.getContributors().call();
    //     const balance = await web3.eth.getBalance(account.options.address);

    //     this.setState({ contributors, balance });
    // }

    onSubmit = async (event) => {
        event.preventDefault();

        const accounts = await web3.eth.getAccounts();

        await account.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei(this.state.value, "ether"),
        });

    };

    onGetBalance = async () => {
        const balance = await web3.eth.getBalance(account.options.address);

        this.setState({ balance });
    }

    onGetContributors = async () => {
        const contributors = await account.methods.getContributors().call();

        this.setState({ contributors });
    }

    render(){
        return (
            <div>
                <div>
                    <form onSubmit={this.onSubmit}>
                        <h3>Contribute!</h3>
                        <div>
                            <label>Amount in ether: </label>
                            <input 
                                value={this.state.value}
                                onChange={(event) => this.setState({ value: event.target.value })}
                            />
                        </div>
                        <button>Contribute</button>
                    </form>
                </div>

                <hr />
                
                <div>
                    <h4>Contract Balance: {web3.utils.fromWei(this.state.balance, "ether")} ether</h4>
                    <button onClick={this.onGetBalance}>Show contract balance</button>
                </div>

                <hr />

                <div>
                    <h4>Contributors: {this.state.contributors}</h4>
                    <button onClick={this.onGetContributors}>Show contributors count</button>
                </div>

                <hr />
        </div>
        );
    } 
        
}

export default AccountApp;

