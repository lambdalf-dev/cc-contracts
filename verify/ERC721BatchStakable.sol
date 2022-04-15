// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "./IERC721Receiver.sol";
import "./ERC721Batch.sol";

/**
* @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
* the Metadata extension and the Enumerable extension.
* 
* Note: This implementation is only compatible with a sequential order of tokens minted.
* If you need to mint tokens in a random order, you will need to override the following functions:
* Note also that this implementations is fairly inefficient and as such, 
* those functions should be avoided inside non-view functions.
*/
abstract contract ERC721BatchStakable is ERC721Batch, IERC721Receiver {
	// Mapping of tokenId to stakeholder address
	mapping( uint256 => address ) internal _stakedOwners;

	// **************************************
	// *****          INTERNAL          *****
	// **************************************
		/**
		* @dev Internal function returning the number of tokens staked by `tokenOwner_`.
		*/
		function _balanceOfStaked( address tokenOwner_ ) internal view virtual returns ( uint256 ) {
			if ( tokenOwner_ == address( 0 ) ) {
				return 0;
			}

			uint256 _supplyMinted_ = _supplyMinted();
			uint256 _count_ = 0;
			for ( uint256 i; i < _supplyMinted_; i++ ) {
				if ( _stakedOwners[ i ] == tokenOwner_ ) {
					_count_++;
				}
			}
			return _count_;
		}

		/**
		* @dev Internal function that mints `qtyMinted_` tokens and stakes `qtyStaked_` of them to the count of `tokenOwner_`.
		*/
		function _mintAndStake( address tokenOwner_, uint256 qtyMinted_, uint256 qtyStaked_ ) internal {
			uint256 _qtyNotStaked_;
			uint256 _qtyStaked_ = qtyStaked_;
			if ( qtyStaked_ > qtyMinted_ ) {
				_qtyStaked_ = qtyMinted_;
			}
			else if ( qtyStaked_ < qtyMinted_ ) {
				_qtyNotStaked_ = qtyMinted_ - qtyStaked_;
			}
			if ( _qtyStaked_ > 0 ) {
				_mintInContract( tokenOwner_, _qtyStaked_ );
			}
			if ( _qtyNotStaked_ > 0 ) {
				_mint( tokenOwner_, _qtyNotStaked_ );
			}
		}

		/**
		* @dev Internal function that mints `qtyStaked_` tokens and stakes them to the count of `tokenOwner_`.
		*/
		function _mintInContract( address tokenOwner_, uint256 qtyStaked_ ) internal {
			uint256 _currentToken_ = _supplyMinted();
			uint256 _lastToken_ = _currentToken_ + qtyStaked_ - 1;

			while ( _currentToken_ <= _lastToken_ ) {
				_stakedOwners[ _currentToken_ ] = tokenOwner_;
				_currentToken_ ++;
			}

			_mint( address( this ), qtyStaked_ );
		}

		/**
		* @dev Internal function returning the owner of the staked token number `tokenId_`.
		*
		* Requirements:
		*
		* - `tokenId_` must exist.
		*/
		function _ownerOfStaked( uint256 tokenId_ ) internal view virtual returns ( address ) {
			return _stakedOwners[ tokenId_ ];
		}

		/**
		* @dev Internal function that stakes the token number `tokenId_` to the count of `tokenOwner_`.
		*/
		function _stake( address tokenOwner_, uint256 tokenId_ ) internal {
			_stakedOwners[ tokenId_ ] = tokenOwner_;
			_transfer( tokenOwner_, address( this ), tokenId_ );
		}

		/**
		* @dev Internal function that unstakes the token `tokenId_` and transfers it back to `tokenOwner_`.
		*/
		function _unstake( address tokenOwner_, uint256 tokenId_ ) internal {
			_transfer( address( this ), tokenOwner_, tokenId_ );
			delete _stakedOwners[ tokenId_ ];
		}
	// **************************************

	// **************************************
	// *****           PUBLIC           *****
	// **************************************
		/**
		* @dev Stakes the token `tokenId_` to the count of its owner.
		* 
		* Requirements:
		* 
		* - Caller must be allowed to manage `tokenId_` or its owner's tokens.
		* - `tokenId_` must exist.
		*/
		function stake( uint256 tokenId_ ) external exists( tokenId_ ) {
			address _operator_ = _msgSender();
			address _tokenOwner_ = _ownerOf( tokenId_ );
			bool _isApproved_ = _isApprovedOrOwner( _tokenOwner_, _operator_, tokenId_ );

			if ( ! _isApproved_ ) {
				revert IERC721_CALLER_NOT_APPROVED();
			}
			_stake( _tokenOwner_, tokenId_ );
		}

		/**
		* @dev Unstakes the token `tokenId_` and returns it to its owner.
		* 
		* Requirements:
		* 
		* - Caller must be allowed to manage `tokenId_` or its owner's tokens.
		* - `tokenId_` must exist.
		*/
		function unstake( uint256 tokenId_ ) external exists( tokenId_ ) {
			address _operator_ = _msgSender();
			address _tokenOwner_ = _ownerOfStaked( tokenId_ );
			bool _isApproved_ = _isApprovedOrOwner( _tokenOwner_, _operator_, tokenId_ );

			if ( ! _isApproved_ ) {
				revert IERC721_CALLER_NOT_APPROVED();
			}
			_unstake( _tokenOwner_, tokenId_ );
		}
	// **************************************

	// **************************************
	// *****            VIEW            *****
	// **************************************
		/**
		* @dev Returns the number of tokens owned by `tokenOwner_`.
		*/
		function balanceOf( address tokenOwner_ ) public view virtual override returns ( uint256 balance ) {
			return _balanceOfStaked( tokenOwner_ ) + _balanceOf( tokenOwner_ );
		}

		/**
		* @dev Returns the number of tokens staked by `tokenOwner_`.
		*/
		function balanceOfStaked( address tokenOwner_ ) public view virtual returns ( uint256 ) {
			return _balanceOfStaked( tokenOwner_ );
		}

		/**
		* @dev Returns the owner of token number `tokenId_`.
		*
		* Requirements:
		*
		* - `tokenId_` must exist.
		*/
		function ownerOf( uint256 tokenId_ ) public view virtual override exists( tokenId_ ) returns ( address ) {
			address _tokenOwner_ = _ownerOf( tokenId_ );
			if ( _tokenOwner_ == address( this ) ) {
				return _ownerOfStaked( tokenId_ );
			}
			return _tokenOwner_;
		}

		/**
		* @dev Returns the owner of staked token number `tokenId_`.
		*
		* Requirements:
		*
		* - `tokenId_` must exist.
		*/
		function ownerOfStaked( uint256 tokenId_ ) public view virtual exists( tokenId_ ) returns ( address ) {
			return _ownerOfStaked( tokenId_ );
		}
	// **************************************

	// **************************************
	// *****            PURE            *****
	// **************************************
		/**
		* @dev Signals that this contract knows how to handle ERC721 tokens.
		*/
		function onERC721Received( address, address, uint256, bytes memory ) public override pure returns ( bytes4 ) {
			return type( IERC721Receiver ).interfaceId;
		}
	// **************************************
}
