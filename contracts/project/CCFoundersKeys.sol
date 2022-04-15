// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../tokens/ERC721/extensions/ERC721BatchEnumerable.sol';
import '../tokens/ERC721/extensions/ERC721BatchStakable.sol';
import '../utils/ERC2981Base.sol';
import '../utils/IOwnable.sol';
import '../utils/IPausable.sol';
import '../utils/ITradable.sol';
import '../utils/IWhitelistable.sol';

contract CCFoundersKeys is ERC721BatchEnumerable, ERC721BatchStakable, ERC2981Base, IOwnable, IPausable, ITradable, IWhitelistable {
	// Events
	event PaymentReleased( address indexed from, address[] indexed tos, uint256[] indexed amounts );

	// Errors
	error CCFoundersKeys_ARRAY_LENGTH_MISMATCH();
	error CCFoundersKeys_FORBIDDEN();
	error CCFoundersKeys_INCORRECT_PRICE();
	error CCFoundersKeys_INSUFFICIENT_KEY_BALANCE();
	error CCFoundersKeys_MAX_BATCH();
	error CCFoundersKeys_MAX_RESERVE();
	error CCFoundersKeys_MAX_SUPPLY();
	error CCFoundersKeys_NO_ETHER_BALANCE();
	error CCFoundersKeys_TRANSFER_FAIL();

	// Founders Key whitelist mint price
	uint public immutable WL_MINT_PRICE; // = 0.069 ether;

	// Founders Key public mint price
	uint public immutable PUBLIC_MINT_PRICE; // = 0.1 ether;

	// Max supply
	uint public immutable MAX_SUPPLY;

	// Max TX
	uint public immutable MAX_BATCH;

	// 2C Safe wallet ~ 90%
	address private immutable _CC_SAFE;

	// 2C Operations wallet ~ 5%
	address private immutable _CC_CHARITY;

	// 2C Founders wallet ~ 2.5%
	address private immutable _CC_FOUNDERS;

	// 2C Community wallet ~ 2.5%
	address private immutable _CC_COMMUNITY;

	// Mapping of Anon holders to amount of free key claimable
	mapping( address => uint256 ) public anonClaimList;

	uint256 private _reserve;

	constructor(
		uint256 reserve_,
		uint256 maxBatch_,
		uint256 maxSupply_,
		uint256 royaltyRate_,
		uint256 wlMintPrice_,
		uint256 publicMintPrice_,
		string memory name_,
		string memory symbol_,
		string memory baseURI_,
		// address devAddress_,
		address[] memory wallets_
	) {
		address _contractOwner_ = _msgSender();
		_initIOwnable( _contractOwner_ );
		_initERC2981Base( _contractOwner_, royaltyRate_ );
		_initERC721BatchMetadata( name_, symbol_ );
		_setBaseURI( baseURI_ );
		_CC_SAFE          = wallets_[ 0 ];
		_CC_CHARITY       = wallets_[ 1 ];
		_CC_FOUNDERS      = wallets_[ 2 ];
		_CC_COMMUNITY     = wallets_[ 3 ];
		_reserve          = reserve_;
		MAX_BATCH         = maxBatch_;
		MAX_SUPPLY        = maxSupply_;
		WL_MINT_PRICE     = wlMintPrice_;
		PUBLIC_MINT_PRICE = publicMintPrice_;
		// _mintAndStake( devAddress_, 5 );
	}

	// **************************************
	// *****          INTERNAL          *****
	// **************************************
		/**
		* @dev Internal function returning whether `operator_` is allowed to manage tokens on behalf of `tokenOwner_`.
		* 
		* @param tokenOwner_ address that owns tokens
		* @param operator_ address that tries to manage tokens
		* 
		* @return bool whether `operator_` is allowed to manage the token
		*/
		function _isApprovedForAll( address tokenOwner_, address operator_ ) internal view virtual override returns ( bool ) {
			return _isRegisteredProxy( tokenOwner_, operator_ ) ||
						 super._isApprovedForAll( tokenOwner_, operator_ );
		}

		/**
		* @dev Replacement for Solidity's `transfer`: sends `amount_` wei to
		* `recipient_`, forwarding all available gas and reverting on errors.
		*
		* https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
		* of certain opcodes, possibly making contracts go over the 2300 gas limit
		* imposed by `transfer`, making them unable to receive funds via
		* `transfer`. {sendValue} removes this limitation.
		*
		* https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
		*
		* IMPORTANT: because control is transferred to `recipient`, care must be
		* taken to not create reentrancy vulnerabilities. Consider using
		* {ReentrancyGuard} or the
		* https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
		*/
		function _sendValue( address payable recipient_, uint256 amount_ ) internal {
			if ( address( this ).balance < amount_ ) {
				revert CCFoundersKeys_INCORRECT_PRICE();
			}
			( bool _success_, ) = recipient_.call{ value: amount_ }( "" );
			if ( ! _success_ ) {
				revert CCFoundersKeys_TRANSFER_FAIL();
			}
		}
	// **************************************

	// **************************************
	// *****           PUBLIC           *****
	// **************************************
		/**
		* @dev Mints `qty_` tokens and transfers them to the caller.
		* 
		* Requirements:
		* 
		* - Sale state must be {SaleState.PRESALE}.
		* - There must be enough tokens left to mint outside of the reserve.
		* - Caller must be whitelisted.
		*/
		function claim( uint256 qty_ ) external presaleOpen {
			address _account_   = _msgSender();
			if ( qty_ > anonClaimList[ _account_ ] ) {
				revert CCFoundersKeys_FORBIDDEN();
			}

			uint256 _endSupply_ = _supplyMinted() + qty_;
			if ( _endSupply_ > MAX_SUPPLY - _reserve ) {
				revert CCFoundersKeys_MAX_SUPPLY();
			}

			unchecked {
				anonClaimList[ _account_ ] -= qty_;
			}
			_mint( _account_, qty_ );
		}

		/**
		* @dev Mints `qty_` tokens, stakes `qtyStaked_` of them to the count of the caller, and transfers the remaining to them.
		* 
		* Requirements:
		* 
		* - Sale state must be {SaleState.PRESALE}.
		* - There must be enough tokens left to mint outside of the reserve.
		* - Caller must be whitelisted.
		* - If `qtyStaked_` is higher than `qty_`, only `qty_` tokens are staked.
		*/
		function claimAndStake( uint256 qty_, uint256 qtyStaked_ ) external presaleOpen {
			address _account_   = _msgSender();
			if ( qty_ > anonClaimList[ _account_ ] ) {
				revert CCFoundersKeys_FORBIDDEN();
			}

			uint256 _endSupply_ = _supplyMinted() + qty_;
			if ( _endSupply_ > MAX_SUPPLY - _reserve ) {
				revert CCFoundersKeys_MAX_SUPPLY();
			}

			unchecked {
				anonClaimList[ _account_ ] -= qty_;
			}
			_mintAndStake( _account_, qty_, qtyStaked_ );
		}

		/**
		* @dev Mints `qty_` tokens and transfers them to the caller.
		* 
		* Requirements:
		* 
		* - Sale state must be {SaleState.PRESALE}.
		* - There must be enough tokens left to mint outside of the reserve.
		* - Caller must send enough ether to pay for `qty_` tokens at presale price.
		* - Caller must be whitelisted.
		*/
		function mintPreSale( uint256 qty_, bytes32[] memory proof_, uint256 passMax_ ) external payable presaleOpen isWhitelisted( _msgSender(), proof_, passMax_, qty_ ) {

			uint256 _endSupply_  = _supplyMinted() + qty_;
			if ( _endSupply_ > MAX_SUPPLY - _reserve ) {
				revert CCFoundersKeys_MAX_SUPPLY();
			}

			if ( qty_ * WL_MINT_PRICE != msg.value ) {
				revert CCFoundersKeys_INCORRECT_PRICE();
			}

			address _account_    = _msgSender();
			_consumeWhitelist( _account_, qty_ );
			_mint( _account_, qty_ );
		}

		/**
		* @dev Mints `qty_` tokens, stakes `qtyStaked_` of them to the count of the caller, and transfers the remaining to them.
		* 
		* Requirements:
		* 
		* - Sale state must be {SaleState.PRESALE}.
		* - There must be enough tokens left to mint outside of the reserve.
		* - Caller must send enough ether to pay for `qty_` tokens at presale price.
		* - Caller must be whitelisted.
		* - If `qtyStaked_` is higher than `qty_`, only `qty_` tokens are staked.
		*/
		function mintPreSaleAndStake( uint256 qty_, bytes32[] memory proof_, uint256 passMax_, uint256 qtyStaked_ ) external payable presaleOpen isWhitelisted( _msgSender(), proof_, passMax_, qty_ ) {


			
			uint256 _endSupply_  = _supplyMinted() + qty_;
			if ( _endSupply_ > MAX_SUPPLY - _reserve ) {
				revert CCFoundersKeys_MAX_SUPPLY();
			}

			if ( qty_ * WL_MINT_PRICE != msg.value ) {
				revert CCFoundersKeys_INCORRECT_PRICE();
			}

			address _account_    = _msgSender();
			_consumeWhitelist( _account_, qty_ );
			_mintAndStake( _account_, qty_, qtyStaked_ );
		}

		/**
		* @dev Mints `qty_` tokens and transfers them to the caller.
		* 
		* Requirements:
		* 
		* - Sale state must be {SaleState.SALE}.
		* - There must be enough tokens left to mint outside of the reserve.
		* - Caller must send enough ether to pay for `qty_` tokens at public sale price.
		*/
		function mint( uint256 qty_ ) external payable saleOpen {
			if ( qty_ > MAX_BATCH ) {
				revert CCFoundersKeys_MAX_BATCH();
			}

			uint256 _endSupply_  = _supplyMinted() + qty_;
			if ( _endSupply_ > MAX_SUPPLY - _reserve ) {
				revert CCFoundersKeys_MAX_SUPPLY();
			}

			if ( qty_ * PUBLIC_MINT_PRICE != msg.value ) {
				revert CCFoundersKeys_INCORRECT_PRICE();
			}
			address _account_    = _msgSender();
			_mint( _account_, qty_ );
		}

		/**
		* @dev Mints `qty_` tokens, stakes `qtyStaked_` of them to the count of the caller, and transfers the remaining to them.
		* 
		* Requirements:
		* 
		* - Sale state must be {SaleState.SALE}.
		* - There must be enough tokens left to mint outside of the reserve.
		* - Caller must send enough ether to pay for `qty_` tokens at public sale price.
		* - If `qtyStaked_` is higher than `qty_`, only `qty_` tokens are staked.
		*/
		function mintAndStake( uint256 qty_, uint256 qtyStaked_ ) external payable saleOpen {
			if ( qty_ > MAX_BATCH ) {
				revert CCFoundersKeys_MAX_BATCH();
			}

			uint256 _endSupply_  = _supplyMinted() + qty_;
			if ( _endSupply_ > MAX_SUPPLY - _reserve ) {
				revert CCFoundersKeys_MAX_SUPPLY();
			}

			if ( qty_ * PUBLIC_MINT_PRICE != msg.value ) {
				revert CCFoundersKeys_INCORRECT_PRICE();
			}
			address _account_    = _msgSender();
			_mintAndStake( _account_, qty_, qtyStaked_ );
		}
	// **************************************

	// **************************************
	// *****       CONTRACT_OWNER       *****
	// **************************************
		/**
		* @dev Mints `amounts_` tokens and transfers them to `accounts_`.
		* 
		* Requirements:
		* 
		* - Caller must be the contract owner.
		* - `accounts_` and `amounts_` must have the same length.
		* - There must be enough tokens left in the reserve.
		*/
		function airdrop( address[] memory accounts_, uint256[] memory amounts_ ) external onlyOwner {
			uint256 _len_ = amounts_.length;
			if ( _len_ != accounts_.length ) {
				revert CCFoundersKeys_ARRAY_LENGTH_MISMATCH();
			}
			uint _totalQty_;
			for ( uint256 i = _len_; i > 0; i -- ) {
				_totalQty_ += amounts_[ i - 1 ];
			}
			if ( _totalQty_ > _reserve ) {
				revert CCFoundersKeys_MAX_RESERVE();
			}
			unchecked {
				_reserve -= _totalQty_;
			}
			for ( uint256 i = _len_; i > 0; i -- ) {
				_mint( accounts_[ i - 1], amounts_[ i - 1] );
			}
		}

		/**
		* @dev Saves `accounts_` in the anon claim list.
		* 
		* Requirements:
		* 
		* - Caller must be the contract owner.
		* - Sale state must be {SaleState.CLOSED}.
		* - `accounts_` and `amounts_` must have the same length.
		*/
		function setAnonClaimList( address[] memory accounts_, uint256[] memory amounts_ ) external onlyOwner saleClosed {
			uint256 _len_ = amounts_.length;
			if ( _len_ != accounts_.length ) {
				revert CCFoundersKeys_ARRAY_LENGTH_MISMATCH();
			}
			for ( uint256 i; i < _len_; i ++ ) {
				anonClaimList[ accounts_[ i ] ] = amounts_[ i ];
			}
		}

		/**
		* @dev See {ITradable-setProxyRegistry}.
		* 
		* Requirements:
		* 
		* - Caller must be the contract owner.
		*/
		function setProxyRegistry( address proxyRegistryAddress_ ) external onlyOwner {
			_setProxyRegistry( proxyRegistryAddress_ );
		}

		/**
		* @dev Updates the royalty recipient and rate.
		* 
		* Requirements:
		* 
		* - Caller must be the contract owner.
		*/
		function setRoyaltyInfo( address royaltyRecipient_, uint256 royaltyRate_ ) external onlyOwner {
			_setRoyaltyInfo( royaltyRecipient_, royaltyRate_ );
		}

		/**
		* @dev See {IPausable-setSaleState}.
		* 
		* Requirements:
		* 
		* - Caller must be the contract owner.
		*/
		function setSaleState( SaleState newState_ ) external onlyOwner {
			_setSaleState( newState_ );
		}

		/**
		* @dev See {IWhitelistable-setWhitelist}.
		* 
		* Requirements:
		* 
		* - Caller must be the contract owner.
		* - Sale state must be {SaleState.CLOSED}.
		*/
		function setWhitelist( bytes32 root_ ) external onlyOwner saleClosed {
			_setWhitelist( root_ );
		}

		/**
		* @dev Withdraws all the money stored in the contract and splits it amongst the set wallets.
		* 
		* Requirements:
		* 
		* - Caller must be the contract owner.
		*/
		function withdraw() external onlyOwner {
			uint256 _balance_ = address(this).balance;
			if ( _balance_ == 0 ) {
				revert CCFoundersKeys_NO_ETHER_BALANCE();
			}

			uint256 _safeShare_ = _balance_ * 900 / 1000;
			uint256 _charityShare_ = _balance_ * 50 / 1000;
			uint256 _othersShare_ = _charityShare_ / 2;
			_sendValue( payable( _CC_COMMUNITY ), _othersShare_ );
			_sendValue( payable( _CC_FOUNDERS ), _othersShare_ );
			_sendValue( payable( _CC_CHARITY ), _charityShare_ );
			_sendValue( payable( _CC_SAFE ), _safeShare_ );

			address[] memory _tos_ = new address[]( 4 );
			_tos_[ 0 ] = _CC_COMMUNITY;
			_tos_[ 1 ] = _CC_FOUNDERS;
			_tos_[ 2 ] = _CC_CHARITY;
			_tos_[ 3 ] = _CC_SAFE;
			uint256[] memory _amounts_ = new uint256[]( 4 );
			_amounts_[ 0 ] = _othersShare_;
			_amounts_[ 1 ] = _othersShare_;
			_amounts_[ 2 ] = _charityShare_;
			_amounts_[ 3 ] = _safeShare_;
			emit PaymentReleased( address( this ), _tos_, _amounts_ );
		}
	// **************************************

	// **************************************
	// *****            VIEW            *****
	// **************************************
		/**
		* @dev Returns the number of tokens owned by `tokenOwner_`.
		*/
		function balanceOf( address tokenOwner_ ) public view virtual override(ERC721Batch, ERC721BatchStakable) returns ( uint256 balance ) {
			return ERC721BatchStakable.balanceOf( tokenOwner_ );
		}

		/**
		* @dev Returns the owner of token number `tokenId_`.
		*
		* Requirements:
		*
		* - `tokenId_` must exist.
		*/
		function ownerOf( uint256 tokenId_ ) public view virtual override(ERC721Batch, ERC721BatchStakable) exists( tokenId_ ) returns ( address ) {
			return ERC721BatchStakable.ownerOf( tokenId_ );
		}

		/**
		* @dev See {IERC2981-royaltyInfo}.
		*
		* Requirements:
		*
		* - `tokenId_` must exist.
		*/
		function royaltyInfo( uint256 tokenId_, uint256 salePrice_ ) public view virtual override exists( tokenId_ ) returns ( address, uint256 ) {
			return super.royaltyInfo( tokenId_, salePrice_ );
		}

		/**
		* @dev See {IERC165-supportsInterface}.
		*/
		function supportsInterface( bytes4 interfaceId_ ) public view virtual override(ERC721BatchEnumerable, ERC721Batch, ERC2981Base) returns ( bool ) {
			return 
				interfaceId_ == type( IERC2981 ).interfaceId ||
				ERC721Batch.supportsInterface( interfaceId_ ) ||
				ERC721BatchEnumerable.supportsInterface( interfaceId_ );
		}
	// **************************************
}
