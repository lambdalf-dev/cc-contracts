// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "../../../tokens/ERC721/extensions/ERC721BatchEnumerable.sol";

/**
* @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
* the Metadata extension and the Enumerable extension.
* 
* Note: This implementation is only compatible with a sequential order of tokens minted.
* If you need to mint tokens in a random order, you will need to override the following functions:
* ~ ownerOf() 
* ~ _exists()
* ~ _mint()
* Note also that the implementations of the function balanceof() are extremely inefficient and as such, 
* those functions should be avoided inside non-view functions.
*/
contract Mock_ERC721BatchEnumerable is ERC721BatchEnumerable {
	constructor( uint256 qty_, string memory name_, string memory symbol_ ) {
		_initERC721BatchMetadata( name_, symbol_ );
		if ( qty_ > 0 ) {
			_mint( _msgSender(), qty_ );
		}
	}

	function mint( uint256 qty_ ) public {
		_mint( _msgSender(), qty_ );
	}

	function setBaseURI( string memory baseURI_ ) public {
		_setBaseURI( baseURI_ );
	}
}
