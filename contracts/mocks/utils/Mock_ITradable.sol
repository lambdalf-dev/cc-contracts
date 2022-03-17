// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "../../utils/ITradable.sol";

contract Mock_ITradable is ITradable {
	constructor() {}

	function setProxyRegistry( address proxyRegistryAddress_ ) external {
		_setProxyRegistry( proxyRegistryAddress_ );
	}

	function isRegisteredProxy( address tokenOwner_, address operator_ ) external view returns ( bool ) {
		return _isRegisteredProxy( tokenOwner_, operator_ );
	}
}