// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/Context.sol";
import '../utils/IOwnable.sol';
import '../utils/IInitializable.sol';

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@/      \@@@@/      \@@@@  @@@@@@@@@@  @@@@@@@@@@         \@@/      \@@          @@/      \@@@@@       \@@@@/      \@@
// @@@@@  /@@@@  @@@  /@@@@  @@@  @@@@@@@@@@  @@@@@@@@@@  @@@@@@@@@@  /@@@@  @@@@@  @@@@@@  /@@@@  @@@@  @@@@@  @@@  /@@@@  @@
// @@@@  @@@@@@@@@@  @@@@@@  @@  @@@@@@@@@@  @@@@@@@@@@  @@@@@@@@@@  @@@@@@@@@@@@  @@@@@@  @@@@@@  @@@  @@@@/  @@@  @@@@@@@@@@
// @@@  @@@@@@@@@@  @@@@@@  @@  @@@@@@@@@@  @@@@@@@@@@        @@@@  @@@@@@@@@@@@  @@@@@@  @@@@@@  @@@        /@@@@\      \@@@@
// @@  @@@@@@@@@@  @@@@@@  @@  @@@@@@@@@@  @@@@@@@@@@  @@@@@@@@@@  @@@@@@@@@@@@  @@@@@@  @@@@@@  @@@  @@@  @@@@@@@@@@@@@  @@@@
// @@  @@@@   @@@  @@@@   @@  @@@@@@@@@@  @@@@@@@@@@  @@@@@@@@@@@  @@@@   @@@@  @@@@@@@  @@@@   @@@  @@@@@  @@@@  @@@@/  @@@@@
// @@\      /@@@@\      /@@          @@          @@\         @@@@\      /@@@@  @@@@@@@@\      /@@@  @@@@@@  @@@@\      /@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@@@  @@    @@@@@@@@  @@@@@@  @@  @@@@@@          @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@@  @@  @  @@@@@@@  @@@@@@  @@  @@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@  @@  @@  @@@@@@  @@@@@@  @@  @@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@  @@  @@@  @@@@@  @@@@@@  @@  @@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@  @@        @@@@  @@@@@@  @@  @@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @  @@  @@@@@  @@@  @@@@@@  @@  @@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    @@  @@@@@@  @@          @@          @@  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

contract CCVaultImplementation is Context, IOwnable, IInitializable {
	error CCVault_INSUFFICIENT_AMOUNT_STAKED( uint256 seriesId, uint256 amountRequested, uint256 amountAvailable );
	error CCVault_INSUFFICIENT_REWARDS( uint256 amountRequested, uint256 amountAvailable );
	error CCVault_TOKEN_ALREADY_STAKED( uint256 tokenId );
	error CCVault_TOKEN_NOT_STAKED( uint256 tokenId );

	struct StakingInfo {
		uint256 lastUpdate;
		uint256 rewardsUsed;
		uint256 keys;
		uint256 tier1Crystals;
		uint256 tier2Crystals;
		uint256 tier3Crystals;
	}

	// Staking rewards in tokens per second
	uint256 public KEY_REWARD;
	uint256 public PARTNERED_DROP_REWARD;
	uint256 public DEGEN_DROP_REWARD;

	// Multipliers, out of 1,000:
	// one crystal can only be applied to one key at a time, 
	// and one key can only be applied one crystal at a time
	uint256 public TIER1_MULTIPLIER;
	uint256 public TIER2_MULTIPLIER;
	uint256 public TIER3_MULTIPLIER;

	IERC20   public coinContract;
	IERC721  public keyContract;
	IERC1155 public crystalContract;

	mapping ( address => StakingInfo ) public stakingInfo;
	mapping ( uint256 => address ) private _stakedKeys;

	function initialize( address coinContract_, address keyContract_, address crystalContract_ ) public initializer {
		_initIOwnable( _msgSender() );

		coinContract    = coinContract_;
		keyContract     = keyContract_;
		crystalContract = crystalContract_;

		KEY_REWARD              = 250000000000000000 / 86400;
		PARTNERED_DROP_REWARD    = 100000000000000000 / 86400;
		DEGEN_DROP_REWARD        =  25000000000000000 / 86400;
		TIER1_MULTIPLIER = 4000;
		TIER2_MULTIPLIER = 2500;
		TIER3_MULTIPLIER = 2000;
	}

	// **************************************
	// *****          INTERNAL          *****
	// **************************************
		function _claimRewards( address tokenOwner_ ) internal {
			uint256 _amountEarned_ = getAmountEarned();
			_updateRewards( tokenOwner_ );
			coinContract.transfer( tokenOwner_, _amountEarned_ );
		}

		function _updateRewards( address tokenOwner_ ) internal {
			StakingInfo storage _stakingInfo_ = stakingInfo[ tokenOwner_ ];
			_stakingInfo_.lastUpdate = block.timestamp;
		}

		function _stakeKey( address tokenOwner_, uint256 tokenId_ ) internal {
			if ( _stakedKeys[ tokenId_ ] != address( 0 ) ) {
				revert CCVault_TOKEN_ALREADY_STAKED( tokenId_ );
			}
			_stakedKeys[ tokenId_ ] = _tokenOwner_;
			keyContract.transferFrom( tokenOwner_, address( this ), tokenId_ );
		}

		function _unstakeKey( address tokenOwner_, uint256 tokenId_ ) internal {
			StakingInfo storage _stakingInfo_ = stakingInfo[ tokenOwner_ ];
			if ( _stakedKeys[ tokenId_ ] == address( 0 ) ) {
				revert CCVault_TOKEN_NOT_STAKED( tokenId_ );
			}
			delete _stakedKeys[ tokenId_ ];
			keyContract.transferFrom( address( this ), tokenOwner_, tokenId_ );
		}

		function _stakeKeys( uint256[] memory tokenIds_ ) internal {
			StakingInfo storage _stakingInfo_ = stakingInfo[ tokenOwner_ ];
			address _tokenOwner_ = _msgSender();
			uint256 _qty_ = tokenIds_.length;
			uint256 _index_ = _qty_ - 1;
			while ( _index_ != 0 ) {
				_stakeKey( _tokenOwner_, tokenIds_[ _index_ ] );
				-- _index_;
			}
			_stakeKey( _tokenOwner_, tokenIds_[ 0 ] );
			_stakingInfo_.keys += _qty_;
			if ( _stakingInfo_.lastUpdate != block.timestamp ) {
				_claimRewards( _tokenOwner_ );
			}
		}

		function _unstakeKeys( uint256[] memory tokenIds_ ) internal {
			StakingInfo storage _stakingInfo_ = stakingInfo[ tokenOwner_ ];
			address _tokenOwner_ = _msgSender();
			uint256 _qty_ = tokenIds_.length;
			uint256 _index_ = _qty_ - 1;
			while ( _index_ != 0 ) {
				_unstakeKey( _tokenOwner_, tokenIds_[ _index_ ] );
				-- _index_;
			}
			_unstakeKey( _tokenOwner_, tokenIds_[ 0 ] );
			_stakingInfo_.keys += _qty_;
			if ( _stakingInfo_.lastUpdate != block.timestamp ) {
				_claimRewards( _tokenOwner_ );
			}
		}

		function _stakeCrystals( uint256 tier1Crystals_, uint256 tier2Crystals_, uint256 tier3Crystals_ ) internal {
			address _tokenOwner_ = _msgSender();
			StakingInfo storage _stakingInfo_ = stakingInfo[ _tokenOwner_ ];
			uint256[] memory _ids_     = [];
			uint256[] memory _amounts_ = [];
			if ( tier1Crystals_ > 0 ) {
				_ids_.push( 1 );
				_amounts_.push( tier1Crystals_ );
				unchecked {
					_stakingInfo_.tier1Crystals += tier1Crystals_;
				}
			}
			if ( tier2Crystals_ > 0 ) {
				_ids_.push( 2 );
				_amounts_.push( tier2Crystals_ );
				unchecked {
					_stakingInfo_.tier2Crystals += tier2Crystals_;
				}
			}
			if ( tier3Crystals_ > 0 ) {
				_ids_.push( 3 );
				_amounts_.push( tier3Crystals_ );
				unchecked {
					_stakingInfo_.tier3Crystals += tier3Crystals_;
				}
			}
			if ( _stakingInfo_.lastUpdate != block.timestamp ) {
				_claimRewards( tokenOwner_ );
			}
			crystalContract.safeBatchTransferFrom( _tokenOwner_, address( this ), _ids_, _amounts_, "" );
		}

		function _unstakeCrystals( uint256 tier1Crystals_, uint256 tier2Crystals_, uint256 tier3Crystals_ ) internal {
			address _tokenOwner_ = _msgSender();
			StakingInfo storage _stakingInfo_ = stakingInfo[ _tokenOwner_ ];
			uint256[] memory _ids_     = [];
			uint256[] memory _amounts_ = [];
			if ( tier1Crystals_ > 0 ) {
				if ( tier1Crystals_ > _stakingInfo_.tier1Crystals ) {
					revert CCVault_INSUFFICIENT_AMOUNT_STAKED( 1, tier1Crystals_, _stakingInfo_.tier1Crystals );
				}
				_ids_.push( 1 );
				_amounts_.push( tier1Crystals_ );
				unchecked {
					_stakingInfo_.tier1Crystals -= tier1Crystals_;
				}
			}
			if ( tier2Crystals_ > 0 ) {
				if ( tier2Crystals_ > _stakingInfo_.tier2Crystals ) {
					revert CCVault_INSUFFICIENT_AMOUNT_STAKED( 2, tier2Crystals_, _stakingInfo_.tier2Crystals );
				}
				_ids_.push( 2 );
				_amounts_.push( tier2Crystals_ );
				unchecked {
					_stakingInfo_.tier2Crystals -= tier2Crystals_;
				}
			}
			if ( tier3Crystals_ > 0 ) {
				if ( tier3Crystals_ > _stakingInfo_.tier3Crystals ) {
					revert CCVault_INSUFFICIENT_AMOUNT_STAKED( 3, tier3Crystals_, _stakingInfo_.tier3Crystals );
				}
				_ids_.push( 3 );
				_amounts_.push( tier3Crystals_ );
				unchecked {
					_stakingInfo_.tier3Crystals -= tier3Crystals_;
				}
			}
			if ( _stakingInfo_.lastUpdate != block.timestamp ) {
				_claimRewards( tokenOwner_ );
			}
			crystalContract.safeBatchTransferFrom( address( this ), _tokenOwner_, _ids_, _amounts_, "" );
		}
	// **************************************

	// **************************************
	// *****           PUBLIC           *****
	// **************************************
		function bulkStake( uint256[] memory keys_, uint256 tier1Crystals_, uint256 tier2Crystals_, uint256 tier3Crystals_ ) public {
			if ( keys_.length > 0 ) {
				_stakeKeys( keys_ );
			}
			_stakeCrystals( tier1Crystals_, tier2Crystals_, tier3Crystals_ );
		}

		function bulkUnstake( uint256[] memory keys_, uint256 tier1Crystals_, uint256 tier2Crystals_, uint256 tier3Crystals_ ) public {
			if ( keys_.length > 0 ) {
				_unstakeKeys( keys_ );
			}
			_unstakeCrystals( tier1Crystals_, tier2Crystals_, tier3Crystals_ );
		}

		function claimRewards() public {
			address _tokenOwner_ = _msgSender();
			if ( stakingInfo[ _tokenOwner_ ].lastUpdate != block.timestamp ) {
				_claimRewards( _tokenOwner_ );
			}
		}

		function spendRewards( uint256 amountSpent_ ) public {
			address _tokenOwner_      = _msgSender();
			uint256 _amountEarned_    = getAmountEarned( _tokenOwner_ );
			uint256 _amountAvailable_ = coinContract.balanceOf( _tokenOwner_ ) + _amountEarned_;
			if ( _amountAvailable_ < amountSpent_ ) {
				revert ( CCVault_INSUFFICIENT_REWARDS( amountSpent_, _amountAvailable_ ) );
			}
			_updateRewards( _tokenOwner_ );
			if ( _amountEarned_ > amountSpent_ ) {
				coinContract.transfer( _tokenOwner_, _amountEarned_ - amountSpent_ );				
			}
			else if ( _amountEarned_ < amountSpent_ ) {
				coinContract.transferFrom( _tokenOwner_, address( this ), amountSpent_ - _amountEarned_ );
			}
		}
	// **************************************

	// **************************************
	// *****       CONTRACT_OWNER       *****
	// **************************************
		function setContractAddresses( address coinContract_, address keyContract_, address crystalContract_ ) public onlyOwner {
			coinContract    = coinContract_;
			keyContract     = keyContract_;
			crystalContract = crystalContract_;
		}

		function setRewards( uint256 keyReward_, uint256 partneredDropReward_, uint256 degenDropReward_, uint256 tier1Multiplier_, uint256 tier2Multiplier_, uint256 tier3Multiplier_ ) public onlyOwner {
			KEY_REWARD            = keyReward_;
			PARTNERED_DROP_REWARD = partneredDropReward_;
			DEGEN_DROP_REWARD     = degenDropReward_;
			TIER1_MULTIPLIER      = tier1Multiplier_;
			TIER2_MULTIPLIER      = tier2Multiplier_;
			TIER3_MULTIPLIER      = tier3Multiplier_;
		}
	// **************************************

	// **************************************
	// *****            VIEW            *****
	// **************************************
		function getAmountEarned( address tokenOwner_ ) public view returns ( uint256 ) {
			StakingInfo storage _stakingInfo_ = stakingInfo[ tokenOwner_ ];
			return rewardsPerSecond( tokenOwner_ ) * ( block.timestamp - _stakingInfo_.lastUpdate );
		}

		function getStakedTokens( address tokenOwner_ ) public view returns ( uint256[] memory keys, uint256 tier1Crystals, uint256 tier2Crystals, uint256 tier3Crystals ) {
			StakingInfo memory _stakingInfo_ = stakingInfo[ tokenOwner_ ];
			return (
				_stakingInfo_.keys,
				_stakingInfo_.tier1Crystals,
				_stakingInfo_.tier2Crystals,
				_stakingInfo_.tier3Crystals
			);
		}

		function rewardsPerSecond( address tokenOwner_ ) public view returns ( uint256 ) {
			StakingInfo storage _stakingInfo_ = stakingInfo[ tokenOwner_ ];

			uint256 _tier1_ = _stakingInfo_.tier1Crystals;
			uint256 _tier2_ = _stakingInfo_.tier2Crystals;
			uint256 _tier3_ = _stakingInfo_.tier3Crystals;
			uint256 _reward_;

			for ( uint256 i; i < _stakingInfo_.keys; i ++ ) {
				if ( _tier1_ > 0 ) {
					_reward_ += KEY_REWARD * TIER1_MULTIPLIER / 1000;
					_tier1_ --;
				}
				else if ( _tier2_ > 0 ) {
					_reward_ += KEY_REWARD * TIER2_MULTIPLIER / 1000;
					_tier2_ --;
				}
				else if ( _tier3_ > 0 ) {
					_reward_ += KEY_REWARD * TIER3_MULTIPLIER / 1000;
					_tier3_ --;
				}
				else {
					_reward_ += KEY_REWARD;
				}
			}

			return _reward_;
		}
	// **************************************

	// **************************************
	// *****            PURE            *****
	// **************************************
		/**
		* @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
		* by `operator` from `from`, this function is called.
		*
		* It must return its Solidity selector to confirm the token transfer.
		* If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.
		*
		* The selector can be obtained in Solidity with `IERC721.onERC721Received.selector`.
		*/
		function onERC721Received( address operator, address from, uint256 id, bytes calldata data ) external returns ( bytes4 ) {
			return ERC721TokenReceiver.onERC721Received.selector;
		}

		/**
		* @notice Handle the receipt of a single ERC1155 token type.
		* @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeTransferFrom` after the balance has been updated.
		* This function MAY throw to revert and reject the transfer.
		* Return of other amount than the magic value MUST result in the transaction being reverted.
		* Note: The token contract address is always the message sender.
		* @param operator  The address which called the `safeTransferFrom` function.
		* @param from      The address which previously owned the token.
		* @param id        The id of the token being transferred.
		* @param amount    The amount of tokens being transferred.
		* @param data      Additional data with no specified format.
		* @return           `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`.
		*/
		function onERC1155Received( address operator, address from, uint256 id, uint256 amount, bytes calldata data ) external returns ( bytes4 ) {
			return ERC1155TokenReceiver.onERC1155Received.selector;
		}

		/**
		* @notice Handle the receipt of multiple ERC1155 token types.
		* @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeBatchTransferFrom` after the balances have been updated.
		* This function MAY throw to revert and reject the transfer.
		* Return of other amount than the magic value WILL result in the transaction being reverted.
		* Note: The token contract address is always the message sender.
		* @param operator  The address which called the `safeBatchTransferFrom` function.
		* @param from      The address which previously owned the token.
		* @param ids       An array containing ids of each token being transferred.
		* @param amounts   An array containing amounts of each token being transferred.
		* @param data      Additional data with no specified format.
		* @return           `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`.
		*/
		function onERC1155BatchReceived( address operator, address from, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data ) external returns ( bytes4 ) {
			return ERC1155TokenReceiver.onERC1155BatchReceived.selector;
		}
	// **************************************

	/**
	* @dev This empty reserved space is put in place to allow future versions to add new
	* variables without shifting down storage in the inheritance chain.
	* See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
	*/
	uint256[ 39 ] private __gap;
}
