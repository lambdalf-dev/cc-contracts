// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "../../utils/IWhitelistable.sol";

contract Mock_IWhitelistable is IWhitelistable {
	constructor() {}

	function setWhitelist( bytes32 root_ ) public {
		_setWhitelist( root_ );
	}

	function checkWhitelistAllowance( address account_, bytes32 proof_, bool flag_, uint256 passMax_ ) public view returns ( uint256 ) {
		return _checkWhitelistAllowance( account_, proof_, flag_, passMax_ );
	}

	function consumeWhitelist( address account_, bytes32 proof_, bool flag_, uint256 passMax_, uint256 qty_ ) public isWhitelisted( account_, proof_, flag_, passMax_, qty_ ) {
		_consumeWhitelist( account_, qty_ );
	}
}
