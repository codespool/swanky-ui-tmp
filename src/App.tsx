// Copyright 2017-2023 @polkadot/example-react authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useEffect, useState} from "react";

import {ApiPromise, Keyring, WsProvider} from "@polkadot/api";
import {Abi, ContractPromise} from "@polkadot/api-contract";

import {Button, Col, Container, Input, Row} from "reactstrap";

import abiData from "./abi.json";
export function App(): React.ReactElement {
  const WS_PROVIDER = "ws://127.0.0.1:9944";
  const gasLimit = 1000000000001;
  const storageDepositLimit = null;

  const [address, setAddress] = useState("");
  const [value, setValue] = useState("");

  const query = async (contract: ContractPromise, address: string) => {
    // (We perform the send from an account, here using Alice's address)
    const {gasRequired, result, output} = await contract.query.get(address, {
      gasLimit,
      storageDepositLimit,
    });

    // The actual result from RPC as `ContractExecResult`
    console.log(result.toHuman());

    // the gas consumed for contract execution
    console.log(gasRequired.toHuman());

    // check if the call was successful
    if (result.isOk) {
      // output the return value
      console.log("Success", output?.toHuman());

      if (output) {
        setValue(output?.toString());
      }
    } else {
      console.error("Error", result.asErr);
    }
  };

  const flip = async () => {
    const provider = new WsProvider(WS_PROVIDER);
    const api = new ApiPromise({provider});

    await api.isReady;

    const keyring = new Keyring({type: "sr25519"});

    const alice = keyring.addFromUri("//Alice", {name: "Alice default"});

    console.log("API is ready");

    const abi = new Abi(abiData, api.registry.getChainProperties());

    const contract = new ContractPromise(api, abi, address);

    const queryResult = await contract.query.flip(alice.address, {
      gasLimit: -1,
      storageDepositLimit,
    });
    // Send the transaction, like elsewhere this is a normal extrinsic
    // with the same rules as applied in the API (As with the read example,
    // additional params, if required can follow)
    await contract.tx
      .flip({storageDepositLimit, gasLimit: queryResult.gasRequired})
      .signAndSend(alice, async (res) => {
        if (res.status.isInBlock) {
          console.log("in a block");
        } else if (res.status.isFinalized) {
          console.log("finalized");
        }
      });

    await query(contract, alice.address);
  };

  function submitSmartContractAddress() {
    const smartContractAddress = (
      document.getElementById("smartContractAddress") as HTMLInputElement
    )?.value;
    (document.getElementById("smartContractOutput") as HTMLInputElement).value =
      smartContractAddress;
    setAddress(smartContractAddress);
  }

  return (
    <Container className="bg-light border">
      <Row>
        <Col md="2"></Col>
        <Col md="8">
          <h1>Flipper</h1>
          <h3>Enter Smart Contract Address</h3>
          <Input id="smartContractAddress" />
          <Button id="submitBtn" onClick={submitSmartContractAddress} color="primary">
            Submit
          </Button>
          <h3>Smart Contract Address</h3>
          <Input id="smartContractOutput" disabled></Input>
          <h3>
            Value: <div id="flipOutput">{value}</div>
          </h3>
          <h3>Press button below to flip the value</h3>
          <Button id="flipBtn" onClick={flip} color="primary">
            Flip
          </Button>
        </Col>
        <Col md="2"></Col>
      </Row>
    </Container>
  );
}
