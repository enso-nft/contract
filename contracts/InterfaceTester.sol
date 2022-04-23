//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Contract.sol";

contract InterfaceTester {
    Contract private _deployedContract;

    constructor(Contract deployedContract_) {
        _deployedContract = deployedContract_;
    }

    function testIERC721() public view returns (bool) {
        return _deployedContract.supportsInterface(type(IERC721).interfaceId);
    }

    function testIERC721Enumerable() public view returns (bool) {
        return
            _deployedContract.supportsInterface(
                type(IERC721Enumerable).interfaceId
            );
    }

    function testIERC2981() public view returns (bool) {
        return _deployedContract.supportsInterface(type(IERC2981).interfaceId);
    }
}
