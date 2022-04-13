// **************************************
// *****           IMPORT           *****
// **************************************
	const { TEST_ACTIVATION } = require( '../test-activation-module' )
	const {
		CST,
		THROW,
		ERROR,
		USER1,
		USER2,
		USER_NAMES,
		PROXY_USER,
		TOKEN_OWNER,
		OTHER_OWNER,
		CONTRACT_DEPLOYER,
	} = require( '../test-var-module' )

	const chai = require( 'chai' )
	const chaiAsPromised = require( 'chai-as-promised' )
	chai.use( chaiAsPromised )
	const expect = chai.expect

	const { ethers, waffle } = require( 'hardhat' )
	const { loadFixture, deployContract } = waffle

	const {
		getTestCasesByFunction,
		generateTestCase,
	} = require( '../fail-test-module' )

	const {
		shouldRevertWhenRequestedTokenDoesNotExist,
		shouldRevertWhenCallerIsNotApproved,
	} = require( './behavior.ERC721Base' )
// **************************************

// **************************************
// *****       TEST VARIABLES       *****
// **************************************
	// For activating or de-activating test cases
	const TEST = {
		EVENTS : {
			Approval            : true,
			ApprovalForAll      : true,
			ConsecutiveTransfer : true,
			Transfer            : true,
		},
		METHODS : {
			// **************************************
			// *****           PUBLIC           *****
			// **************************************
				safeTransferFrom  : true,
				stake             : true,
				transferFrom      : true,
				unstake           : true,
			// **************************************

			// **************************************
			// *****            VIEW            *****
			// **************************************
				balanceOfStaked   : true,
				ownerOfStaked     : true,
			// **************************************

			// **************************************
			// *****            PURE            *****
			// **************************************
				onERC721Received  : true,
			// **************************************
		},
	}

	// For contract data
	const CONTRACT = {
		EVENTS : {
			Approval            : 'Approval',
			ApprovalForAll      : 'ApprovalForAll',
			ConsecutiveTransfer : 'ConsecutiveTransfer',
			Transfer            : 'Transfer',
		},
		METHODS : {
			// **************************************
			// *****           PUBLIC           *****
			// **************************************
				safeTransferFrom     : {
					SIGNATURE          : 'safeTransferFrom(address,address,uint256)',
					PARAMS             : [ 'from_', 'to_', 'tokenId_' ],
				},
				safeTransferFrom_ol  : {
					SIGNATURE          : 'safeTransferFrom(address,address,uint256,bytes)',
					PARAMS             : [ 'from_', 'to_', 'tokenId_', 'data_' ],
				},
				stake                : {
					SIGNATURE          : 'stake(uint256)',
					PARAMS             : [ 'tokenId_' ],
				},
				transferFrom         : {
					SIGNATURE          : 'transferFrom(address,address,uint256)',
					PARAMS             : [ 'from_', 'to_', 'tokenId_' ],
				},
				unstake              : {
					SIGNATURE          : 'unstake(uint256)',
					PARAMS             : [ 'tokenId_' ],
				},
			// **************************************

			// **************************************
			// *****            VIEW            *****
			// **************************************
				balanceOfStaked      : {
					SIGNATURE          : 'balanceOfStaked(address)',
					PARAMS             : [ 'tokenOwner_' ],
				},
				ownerOfStaked        : {
					SIGNATURE          : 'ownerOfStaked(uint256)',
					PARAMS             : [ 'tokenId_' ],
				},
			// **************************************

			// **************************************
			// *****            PURE            *****
			// **************************************
				onERC721Received     : {
					SIGNATURE          : 'onERC721Received(address,address,uint256,bytes)',
					PARAMS             : [ 'operator_', 'from_', 'tokenId_', 'data_' ],
				},
			// **************************************
		},
	}

	let contract
	let users = {}
// **************************************

// **************************************
// *****        TEST  SUITES        *****
// **************************************
	function shouldBehaveLikeERC721BatchStakable ( fixture, test_data ) {
		describe( 'Should behave like ERC721BatchStakable', function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_user1,
						test_user2,
						test_contract,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract = test_contract
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****            VIEW            *****
				// **************************************
					describe( CONTRACT.METHODS.balanceOfStaked.SIGNATURE, function () {
						if ( TEST.METHODS.balanceOfStaked ) {
							it( USER_NAMES[ TOKEN_OWNER ] + ' should have staked ' + test_data.TOKEN_OWNER_STAKED + ' tokens', async function () {
								const tokenOwner = users[ TOKEN_OWNER ].address
								expect(
									await contract.balanceOfStaked( tokenOwner )
								).to.equal( test_data.TOKEN_OWNER_STAKED )
							})

							it( USER_NAMES[ TOKEN_OWNER ] + ' should own ' + test_data.TOKEN_OWNER_SUPPLY + ' tokens', async function () {
								const tokenOwner = users[ TOKEN_OWNER ].address
								expect(
									await contract.balanceOf( tokenOwner )
								).to.equal( test_data.TOKEN_OWNER_SUPPLY )
							})

							it( USER_NAMES[ OTHER_OWNER ] + ' should have staked ' + test_data.OTHER_OWNER_STAKED + ' tokens', async function () {
								const tokenOwner = users[ OTHER_OWNER ].address
								expect(
									await contract.balanceOfStaked( tokenOwner )
								).to.equal( test_data.OTHER_OWNER_STAKED )
							})
						}
					})

					describe( CONTRACT.METHODS.ownerOfStaked.SIGNATURE, function () {
						if ( TEST.METHODS.ownerOfStaked ) {
							it( USER_NAMES[ TOKEN_OWNER ] + ' should own staked token number ' + test_data.STAKED_TOKEN, async function () {
								const tokenId = test_data.STAKED_TOKEN
								expect(
									await contract.ownerOfStaked( tokenId )
								).to.equal( users[ TOKEN_OWNER ].address )
							})

							it( 'staking owner of token not staked should be the null address', async function () {
								const tokenId = test_data.TARGET_TOKEN
								expect(
									await contract.ownerOfStaked( tokenId )
								).to.equal( CST.ADDRESS_ZERO )
							})
						}
					})
				// **************************************

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.safeTransferFrom.SIGNATURE, function () {
						if ( TEST.METHODS.safeTransferFrom ) {
							it( 'Trying to safe transfer a staked token should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async function () {
								const from    = users[ TOKEN_OWNER ].address
								const to      = users[ USER1 ].address
								const tokenId = test_data.STAKED_TOKEN
								await shouldRevertWhenCallerIsNotApproved(
									contract.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE, function () {
						if ( TEST.METHODS.safeTransferFrom ) {
							it( 'Trying to safe transfer a staked token should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async function () {
								const from    = users[ TOKEN_OWNER ].address
								const to      = users[ USER1 ].address
								const tokenId = test_data.STAKED_TOKEN
								const data    = '0x'
								await shouldRevertWhenCallerIsNotApproved(
									contract.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.stake.SIGNATURE, function () {
						if ( TEST.METHODS.stake ) {
							it( USER_NAMES[ USER1 ] + ' trying to stake token number ' + test_data.TARGET_TOKEN + ' owned by ' + USER_NAMES[ TOKEN_OWNER ] + ' should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async function () {
								const tokenId = test_data.TARGET_TOKEN
								await shouldRevertWhenCallerIsNotApproved(
									contract.connect( users[ USER1 ] )
													.stake( tokenId )
								)
							})

							describe( USER_NAMES[ TOKEN_OWNER ] + ' stakes token number ' + test_data.TARGET_TOKEN, function () {
								beforeEach( async function () {
									const from    = users[ TOKEN_OWNER ].address
									const to      = contract.address
									const tokenId = test_data.TARGET_TOKEN
									await expect(
										contract.connect( users[ TOKEN_OWNER ] )
														.stake( tokenId )
									).to.emit( contract, CONTRACT.EVENTS.Transfer )
											.withArgs( from, to, tokenId )
								})

								it( USER_NAMES[ TOKEN_OWNER ] + ' should now have ' + ( test_data.TOKEN_OWNER_STAKED + 1 ).toString() + ' tokens staked', async function () {
									const tokenOwner = users[ TOKEN_OWNER ].address
									expect(
										await contract.balanceOfStaked( tokenOwner )
									).to.equal( test_data.TOKEN_OWNER_STAKED + 1 )
								})
							})
						}
					})

					describe( CONTRACT.METHODS.transferFrom.SIGNATURE, function () {
						if ( TEST.METHODS.transferFrom ) {
							it( 'Trying to transfer a staked token should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async function () {
								const from    = users[ TOKEN_OWNER ].address
								const to      = users[ USER1 ].address
								const tokenId = test_data.STAKED_TOKEN
								await shouldRevertWhenCallerIsNotApproved(
									contract.transferFrom( from, to, tokenId )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.unstake.SIGNATURE, function () {
						if ( TEST.METHODS.unstake ) {
							it( USER_NAMES[ USER1 ] + ' trying to unstake token number ' + test_data.STAKED_TOKEN + ' owned by ' + USER_NAMES[ TOKEN_OWNER ] + ' should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async function () {
								const tokenId = test_data.STAKED_TOKEN
								await shouldRevertWhenCallerIsNotApproved(
									contract.connect( users[ USER1 ] )
													.unstake( tokenId )
								)
							})

							it( 'Contract should emit a ' + CONTRACT.EVENTS.Transfer + ' event mentioning that token number ' + test_data.STAKED_TOKEN + ' was transfered from the contract to ' + USER_NAMES[ TOKEN_OWNER ], async function () {
								const from    = contract.address
								const to      = users[ TOKEN_OWNER ].address
								const tokenId = test_data.STAKED_TOKEN
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.unstake( tokenId )
								).to.emit( contract, CONTRACT.EVENTS.Transfer )
										.withArgs( from, to, tokenId )
							})
						}
					})
				// **************************************

				// **************************************
				// *****            PURE            *****
				// **************************************
					describe( CONTRACT.METHODS.onERC721Received.SIGNATURE, function () {
						if ( TEST.METHODS.onERC721Received ) {
							it( 'Contract should know how to handle an ERC721 token', async function () {
								const operator = users[ TOKEN_OWNER ].address
								const from     = users[ TOKEN_OWNER ].address
								const tokenId  = test_data.TARGET_TOKEN
								const data     = '0x'
								expect(
									await contract.onERC721Received( operator, from, tokenId, data )
								).to.equal( CST.INTERFACE_ID.IERC721Receiver )
							})
						}
					})
				// **************************************
			}
		})
	}
// **************************************

// **************************************
// *****           EXPORT           *****
// **************************************
module.exports = {
	shouldBehaveLikeERC721BatchStakable,
}
