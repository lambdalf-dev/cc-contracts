const HOLDER_ARTIFACT     = require( '../../artifacts/contracts/mocks/external/Mock_ERC721Receiver.sol/Mock_ERC721Receiver.json' )
const NON_HOLDER_ARTIFACT = require( '../../artifacts/contracts/mocks/external/Mock_NonERC721Receiver.sol/Mock_NonERC721Receiver.json' )
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
		generateTestCase
	} = require( '../fail-test-module' )
// **************************************

// **************************************
// *****       TEST VARIABLES       *****
// **************************************
	// For activating or de-activating test cases
	const TEST = {
		EVENTS : {
			Transfer       : true,
			Approval       : true,
			ApprovalForAll : true,
		},
		METHODS : {
			balanceOf         : true,
			getApproved       : true,
			isApprovedForAll  : true,
			ownerOf           : true,
			approve           : true,
			mint              : true,
			safeTransferFrom  : true,
			setApprovalForAll : true,
			transferFrom      : true,
		},
	}

	// For contract data
	const CONTRACT = {
		EVENTS : {
			Transfer       : 'Transfer',
			Approval       : 'Approval',
			ApprovalForAll : 'ApprovalForAll',
		},
		METHODS : {
			safeTransferFrom : {
				SIGNATURE : 'safeTransferFrom(address,address,uint256)',
				PARAMS    : [ 'from_', 'to_', 'tokenId_' ],
			},
			safeTransferFrom_ol : {
				SIGNATURE : 'safeTransferFrom(address,address,uint256,bytes)',
				PARAMS    : [ 'from_', 'to_', 'tokenId_', 'data_' ],
			},
			transferFrom : {
				SIGNATURE : 'transferFrom(address,address,uint256)',
				PARAMS    : [ 'from_', 'to_', 'tokenId_' ],
			},
			balanceOf : {
				SIGNATURE : 'balanceOf(address)',
				PARAMS    : [ 'tokenOwner_' ],
			},
			ownerOf : {
				SIGNATURE : 'ownerOf(uint256)',
				PARAMS    : [ 'tokenId_' ],
			},
			approve : {
				SIGNATURE : 'approve(address,uint256)',
				PARAMS    : [ 'to_', 'tokenId_' ],
			},
			getApproved : {
				SIGNATURE : 'getApproved(uint256)',
				PARAMS    : [ 'tokenId_' ],
			},
			setApprovalForAll : {
				SIGNATURE : 'setApprovalForAll(address,bool)',
				PARAMS    : [ 'operator_', 'approved_' ],
			},
			isApprovedForAll : {
				SIGNATURE : 'isApprovedForAll(address,address)',
				PARAMS    : [ 'tokenOwner_', 'operator_' ],
			},
		},
	}

	let non_holder_artifact
	let holder_artifact
	let contract
	let users = {}

	// Custom Error type for testing the transfer to ERC721Receiver (copied from Open Zeppelin)
	const Error = [ 'None', 'RevertWithError', 'RevertWithMessage', 'RevertWithoutMessage', 'Panic' ]
		.reduce((acc, entry, idx) => Object.assign({ [entry]: idx }, acc), {})
// **************************************

// **************************************
// *****        TEST  SUITES        *****
// **************************************
	async function shouldRevertWhenRequestedTokenDoesNotExist ( promise ) {
		await expect( promise ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
	}

	async function shouldRevertWhenCallerIsNotApproved ( promise ) {
		await expect( promise ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
	}

	function shouldBehaveLikeERC721BaseBeforeMint ( fixture, test_data ) {
		describe( 'Should behave like ERC721Base before any token is minted', function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				before( async function () {
				})

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

					// holder_artifact     = await ethers.getContractFactory( 'Mock_ERC721Receiver' )
					// non_holder_artifact = await ethers.getContractFactory( 'Mock_NonERC721Receiver' )
				})

				describe( CONTRACT.METHODS.balanceOf.SIGNATURE, function () {
					if ( TEST.METHODS.balanceOf ) {
						it( USER_NAMES[ USER1 ] + ' should have 0 token', async function () {
							const tokenOwner = users[ USER1 ].address
							expect(
								await contract.balanceOf( tokenOwner )
							).to.equal( 0 )
						})

						it( 'Balance of the NULL address should be 0', async function () {
							const tokenOwner = CST.ADDRESS_ZERO
							expect(
								await contract.balanceOf( tokenOwner )
							).to.equal( 0 )
						})
					}
				})

				describe( CONTRACT.METHODS.isApprovedForAll.SIGNATURE, function () {
					if ( TEST.METHODS.isApprovedForAll ) {
						it( USER_NAMES[ TOKEN_OWNER ] + ' does not need approval to manage their own tokens, expect false', async function () {
							const tokenOwner = users[ TOKEN_OWNER ].address
							const operator   = users[ TOKEN_OWNER ].address
							expect(
								await contract.isApprovedForAll( tokenOwner, operator )
							).to.be.false
						})

						it( USER_NAMES[ USER1 ] + ' requires ' + USER_NAMES[ TOKEN_OWNER ] + '\'s approval to manage their tokens, expect false', async function () {
							const tokenOwner = users[ TOKEN_OWNER ].address
							const operator   = users[ USER1       ].address
							expect(
								await contract.isApprovedForAll( tokenOwner, operator )
							).to.be.false
						})
					}
				})
			}
		})
	}

	function shouldBehaveLikeERC721BaseAfterMint ( fixture, test_data ) {
		describe( 'Should behave like ERC721Base after minting some tokens', function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				before( async function () {
				})

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

					// holder_artifact     = await ethers.getContractFactory( 'Mock_ERC721Receiver' )
					// non_holder_artifact = await ethers.getContractFactory( 'Mock_NonERC721Receiver' )
				})

				describe( CONTRACT.METHODS.balanceOf.SIGNATURE, function () {
					if ( TEST.METHODS.balanceOf ) {
						it( 'Balance of ' + USER_NAMES[ TOKEN_OWNER ] + ' should be ' + test_data.TOKEN_OWNER_SUPPLY, async function () {
							const tokenOwner = users[ TOKEN_OWNER ].address
							expect(
								await contract.balanceOf( tokenOwner )
							).to.equal( test_data.TOKEN_OWNER_SUPPLY )
						})

						it( 'Balance of ' + USER_NAMES[ OTHER_OWNER ] + ' should be ' + CST.OTHER_OWNER_SUPPLY, async function () {
							const tokenOwner = users[ OTHER_OWNER ].address
							expect(
								await contract.balanceOf( tokenOwner )
							).to.equal( CST.OTHER_OWNER_SUPPLY )
						})
					}
				})

				describe( CONTRACT.METHODS.getApproved.SIGNATURE, function () {
					if ( TEST.METHODS.getApproved ) {
						it( 'Should be reverted when requested token does not exist', async function () {
							const tokenId = test_data.UNMINTED_TOKEN
							await shouldRevertWhenRequestedTokenDoesNotExist(
								contract.getApproved( tokenId )
							)
						})
					}
				})

				describe( CONTRACT.METHODS.ownerOf.SIGNATURE, function () {
					if ( TEST.METHODS.ownerOf ) {
						it( 'Should be reverted when requested token does not exist', async function () {
							const tokenId = test_data.UNMINTED_TOKEN
							await shouldRevertWhenRequestedTokenDoesNotExist(
								contract.ownerOf( tokenId )
							)
						})

						it( 'Owner of token ' + test_data.TARGET_TOKEN + ' should be ' + USER_NAMES[ TOKEN_OWNER ], async function () {
							const tokenId = test_data.TARGET_TOKEN
							expect(
								await contract.ownerOf( tokenId )
							).to.equal( users[ TOKEN_OWNER ].address )
						})
					}
				})

				describe( CONTRACT.METHODS.approve.SIGNATURE, function () {
					if( TEST.METHODS.approve ) {
						it( 'Should be reverted when requested token does not exist', async function () {
							const to      = users[ TOKEN_OWNER ].address
							const tokenId = test_data.UNMINTED_TOKEN
							await shouldRevertWhenRequestedTokenDoesNotExist(
								contract.connect( users[ TOKEN_OWNER ] )
												.approve( to, tokenId )
							)
						})

						it( 'Trying to approve management of token ' + test_data.TARGET_TOKEN + ' not owned should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async function () {
							const to      = users[ USER1 ].address
							const tokenId = test_data.TARGET_TOKEN
							await shouldRevertWhenCallerIsNotApproved(
								contract.connect( users[ USER1 ] )
												.approve( to, tokenId )
							)
						})

						describe( USER_NAMES[ TOKEN_OWNER ] + ' approve management of token ' + test_data.TARGET_TOKEN + ' owned by ' + USER_NAMES[ USER1 ], function () {
							beforeEach( async function () {
								const from    = users[ TOKEN_OWNER ].address
								const to      = users[ USER1       ].address
								const tokenId = test_data.TARGET_TOKEN
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.approve( to, tokenId )
								).to.emit( contract, CONTRACT.EVENTS.Approval )
										.withArgs( from, to, tokenId )
							})

							it( USER_NAMES[ USER1 ] + ' should be approved to manage token ' + test_data.TARGET_TOKEN, async function () {
								const tokenId = test_data.TARGET_TOKEN
								expect(
									await contract.getApproved( tokenId )
								).to.equal( users[ USER1 ].address )
							})

							describe( USER_NAMES[ USER1 ] + ' trying to approve management of token ' + test_data.TARGET_TOKEN, function () {
								it( 'by ' + USER_NAMES[ TOKEN_OWNER ] + ', should be reverted with ' + ERROR.IERC721_APPROVE_OWNER, async function () {
									const to      = users[ TOKEN_OWNER ].address
									const tokenId = test_data.TARGET_TOKEN
									await expect(
										contract.connect( users[ USER1 ] )
														.approve( to, tokenId )
									).to.be.revertedWith( ERROR.IERC721_APPROVE_OWNER )
								})

								it( 'by someone else, should be be allowed and clear their approval', async function () {
									const to      = users[ USER2 ].address
									const tokenId = test_data.TARGET_TOKEN
									await contract.connect( users[ USER1 ] )
																.approve( to, tokenId )
									expect(
										await contract.getApproved( tokenId )
									).to.equal( users[ USER2 ].address )
								})
							})
						})
					}
				})

				describe( CONTRACT.METHODS.safeTransferFrom.SIGNATURE, function () {
					if( TEST.METHODS.safeTransferFrom ) {
						it( 'Should be reverted when requested token does not exist', async function () {
							const from    = users[ TOKEN_OWNER ].address
							const to      = users[ USER1       ].address
							const tokenId = test_data.UNMINTED_TOKEN
							await shouldRevertWhenRequestedTokenDoesNotExist(
								contract.connect( users[ TOKEN_OWNER ] )
												.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
							)
						})

						it( 'Trying to safe transfer token ' + test_data.TARGET_TOKEN + ' not owned should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async function () {
							const from    = users[ TOKEN_OWNER ].address
							const to      = users[ USER1       ].address
							const tokenId = test_data.TARGET_TOKEN
							await shouldRevertWhenCallerIsNotApproved(
								contract.connect( users[ USER1 ] )
												.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
							)
						})

						it( USER_NAMES[ TOKEN_OWNER ] + ' safe transfering token ' + test_data.FIRST_TOKEN + ' owned', async function () {
							const from    = users[ TOKEN_OWNER ].address
							const to      = users[ USER1       ].address
							const tokenId = test_data.FIRST_TOKEN
							await expect(
								contract.connect( users[ TOKEN_OWNER ] )
												.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
							).to.emit( contract, CONTRACT.EVENTS.Transfer )
									.withArgs( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.FIRST_TOKEN )
						})

						describe( USER_NAMES[ TOKEN_OWNER ] + ' safe transfering token ' + test_data.TARGET_TOKEN + ' owned', function () {
							it( 'To the NULL address should be reverted with ' + ERROR.IERC721_NULL_ADDRESS_TRANSFER, async function () {
								const from    = users[ TOKEN_OWNER ].address
								const to      = CST.ADDRESS_ZERO
								const tokenId = test_data.TARGET_TOKEN
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
								).to.be.revertedWith( ERROR.IERC721_NULL_ADDRESS_TRANSFER )
							})

							it( 'To non ERC721Receiver contract should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async function () {
								const non_holder = await deployContract( users[ CONTRACT_DEPLOYER ], NON_HOLDER_ARTIFACT, [] )
								const from    = users[ TOKEN_OWNER ].address
								const to      = non_holder.address
								const tokenId = test_data.TARGET_TOKEN
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
								).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
							})

							it( 'To a valid ERC721Receiver contract', async function () {
								const retval = CST.INTERFACE_ID.IERC721Receiver
								const error  = Error.None
								const holder_params = [
									retval,
									error
								]
								const holder = await deployContract( users[ CONTRACT_DEPLOYER ], HOLDER_ARTIFACT, holder_params )

								const from    = users[ TOKEN_OWNER ].address
								const to      = holder.address
								const tokenId = test_data.TARGET_TOKEN

								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
												.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
								).to.emit( contract, CONTRACT.EVENTS.Transfer )
										.withArgs( users[ TOKEN_OWNER ].address, holder.address, test_data.TARGET_TOKEN )

								expect(
									await contract.ownerOf( tokenId )
								).to.equal( to )

								expect(
									await contract.balanceOf( to )
								).to.equal( 1 )
							})

							it( 'To a receiver contract returning unexpected value should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async function () {
								const retval = CST.INTERFACE_ID.IERC165
								const error  = Error.None
								const holder_params = [
									retval,
									error
								]
								const invalidReceiver = await deployContract( users[ CONTRACT_DEPLOYER ], HOLDER_ARTIFACT, holder_params )

								const from    = users[ TOKEN_OWNER ].address
								const to      = invalidReceiver.address
								const tokenId = test_data.TARGET_TOKEN

								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
								).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
							})

							it( 'To a receiver contract that reverts with error should be reverted with ' + ERROR.ERC721Receiver_ERROR, async function () {
								const retval = CST.INTERFACE_ID.IERC721Receiver
								const error  = Error.RevertWithError
								const holder_params = [
									retval,
									error
								]
								const invalidReceiver = await deployContract( users[ CONTRACT_DEPLOYER ], HOLDER_ARTIFACT, holder_params )

								const from    = users[ TOKEN_OWNER ].address
								const to      = invalidReceiver.address
								const tokenId = test_data.TARGET_TOKEN

								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
								).to.be.revertedWith( ERROR.ERC721Receiver_ERROR )
							})

							it( 'To a receiver contract that reverts with message should be reverted with ' + ERROR.ERC721Receiver_MESSAGE, async function () {
								const retval = CST.INTERFACE_ID.IERC721Receiver
								const error  = Error.RevertWithMessage
								const holder_params = [
									retval,
									error
								]
								const invalidReceiver = await deployContract( users[ CONTRACT_DEPLOYER ], HOLDER_ARTIFACT, holder_params )

								const from    = users[ TOKEN_OWNER ].address
								const to      = invalidReceiver.address
								const tokenId = test_data.TARGET_TOKEN

								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
								).to.be.revertedWith( ERROR.ERC721Receiver_MESSAGE )
							})

							it( 'To a receiver contract that reverts without message should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async function () {
								const retval = CST.INTERFACE_ID.IERC721Receiver
								const error  = Error.RevertWithoutMessage
								const holder_params = [
									retval,
									error
								]
								const invalidReceiver = await deployContract( users[ CONTRACT_DEPLOYER ], HOLDER_ARTIFACT, holder_params )

								const from    = users[ TOKEN_OWNER ].address
								const to      = invalidReceiver.address
								const tokenId = test_data.TARGET_TOKEN

								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
								).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
							})

							it( 'To a receiver contract that panics should be reverted with ' + ERROR.PANIC, async function () {
								const retval = CST.INTERFACE_ID.IERC721Receiver
								const error  = Error.Panic
								const holder_params = [
									retval,
									error
								]
								const invalidReceiver = await deployContract( users[ CONTRACT_DEPLOYER ], HOLDER_ARTIFACT, holder_params )

								const from    = users[ TOKEN_OWNER ].address
								const to      = invalidReceiver.address
								const tokenId = test_data.TARGET_TOKEN

								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
								).to.be.revertedWith( ERROR.PANIC )
							})

							describe( 'To other user', function () {
								beforeEach( async function () {
									const from    = users[ TOKEN_OWNER ].address
									const to      = users[ USER1       ].address
									const tokenId = test_data.TARGET_TOKEN
									await expect(
										contract.connect( users[ TOKEN_OWNER ] )
														.functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( from, to, tokenId )
									).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.TARGET_TOKEN )
								})

								it( 'Token ' + test_data.TARGET_TOKEN + ' owner should now be ' + USER_NAMES[ USER1 ], async function () {
									const tokenId = test_data.TARGET_TOKEN
									expect(
										await contract.ownerOf( tokenId )
									).to.equal( users[ USER1 ].address )
								})

								it( 'Balance of ' + USER_NAMES[ TOKEN_OWNER ] + ' should now be ' + ( test_data.TOKEN_OWNER_SUPPLY - 1 ).toString(), async function () {
									const tokenOwner = users[ TOKEN_OWNER ].address
									expect(
										await contract.balanceOf( tokenOwner )
									).to.equal( test_data.TOKEN_OWNER_SUPPLY - 1 )
								})

								it( 'Balance of ' + USER_NAMES[ USER1 ] + ' should now be 1', async function () {
									const tokenOwner = users[ USER1 ].address
									expect(
										await contract.balanceOf( tokenOwner )
									).to.equal( 1 )
								})

								it( 'Approved address for token ' + test_data.TARGET_TOKEN + ' should be the NULL address', async function () {
									const tokenId = test_data.TARGET_TOKEN
									expect(
										await contract.getApproved( tokenId )
									).to.equal( CST.ADDRESS_ZERO )
								})
							})
						})
					}
				})

				describe( CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE, function () {
					if( TEST.METHODS.safeTransferFrom ) {
						it( 'Should be reverted when requested token does not exist', async function () {
							const from    = users[ TOKEN_OWNER ].address
							const to      = users[ USER1       ].address
							const tokenId = test_data.UNMINTED_TOKEN
							const data    = '0x'
							await shouldRevertWhenRequestedTokenDoesNotExist(
								contract.connect( users[ TOKEN_OWNER ] )
												.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
							)
						})

						it( 'Trying to safe transfer token ' + test_data.TARGET_TOKEN + ' not owned should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async function () {
							const from    = users[ TOKEN_OWNER ].address
							const to      = users[ USER1       ].address
							const tokenId = test_data.TARGET_TOKEN
							const data    = '0x'
							await shouldRevertWhenCallerIsNotApproved(
								contract.connect( users[ USER1 ] )
												.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
							)
						})

						it( USER_NAMES[ TOKEN_OWNER ] + ' safe transfering token ' + test_data.FIRST_TOKEN + ' owned', async function () {
							const from    = users[ TOKEN_OWNER ].address
							const to      = users[ USER1       ].address
							const tokenId = test_data.FIRST_TOKEN
							const data    = '0x'
							await expect(
								contract.connect( users[ TOKEN_OWNER ] )
												.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
							).to.emit( contract, CONTRACT.EVENTS.Transfer )
									.withArgs( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.FIRST_TOKEN )
						})

						describe( USER_NAMES[ TOKEN_OWNER ] + ' safe transfering token ' + test_data.TARGET_TOKEN + ' owned', function () {
							it( 'To the NULL address should be reverted with ' + ERROR.IERC721_NULL_ADDRESS_TRANSFER, async function () {
								const from    = users[ TOKEN_OWNER ].address
								const to      = CST.ADDRESS_ZERO
								const tokenId = test_data.TARGET_TOKEN
								const data    = '0x'
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
								).to.be.revertedWith( ERROR.IERC721_NULL_ADDRESS_TRANSFER )
							})

							describe( 'To other user', function () {
								beforeEach( async function () {
									const from    = users[ TOKEN_OWNER ].address
									const to      = users[ USER1       ].address
									const tokenId = test_data.TARGET_TOKEN
									const data    = '0x'
									await expect(
										contract.connect( users[ TOKEN_OWNER ] )
														.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
									).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.TARGET_TOKEN )
								})

								it( 'Token ' + test_data.TARGET_TOKEN + ' owner should now be ' + USER_NAMES[ USER1 ], async function () {
									const tokenId = test_data.TARGET_TOKEN
									expect(
										await contract.ownerOf( tokenId )
									).to.equal( users[ USER1 ].address )
								})

								it( 'Balance of ' + USER_NAMES[ TOKEN_OWNER ] + ' should now be ' + ( test_data.TOKEN_OWNER_SUPPLY - 1 ).toString(), async function () {
									const tokenOwner = users[ TOKEN_OWNER ].address
									expect(
										await contract.balanceOf( tokenOwner )
									).to.equal( test_data.TOKEN_OWNER_SUPPLY - 1 )
								})

								it( 'Balance of ' + USER_NAMES[ USER1 ] + ' should now be 1', async function () {
									const tokenOwner = users[ USER1 ].address
									expect(
										await contract.balanceOf( tokenOwner )
									).to.equal( 1 )
								})

								it( 'Approved address for token ' + test_data.TARGET_TOKEN + ' should be the NULL address', async function () {
									const tokenId = test_data.TARGET_TOKEN
									expect(
										await contract.getApproved( tokenId )
									).to.equal( CST.ADDRESS_ZERO )
								})
							})

							it( 'To non ERC721Receiver contract should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async function () {
								const non_holder = await deployContract( users[ CONTRACT_DEPLOYER ], NON_HOLDER_ARTIFACT, [] )
								const from    = users[ TOKEN_OWNER ].address
								const to      = non_holder.address
								const tokenId = test_data.TARGET_TOKEN
								const data    = '0x'
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
								).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
							})

							it( 'To a valid ERC721Receiver contract', async function () {
								const retval = CST.INTERFACE_ID.IERC721Receiver
								const error  = Error.None
								const holder_params = [
									retval,
									error
								]
								const holder = await deployContract( users[ CONTRACT_DEPLOYER ], HOLDER_ARTIFACT, holder_params )

								const from    = users[ TOKEN_OWNER ].address
								const to      = holder.address
								const tokenId = test_data.TARGET_TOKEN
								const data    = '0x'

								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
								).to.emit( contract, CONTRACT.EVENTS.Transfer )
										.withArgs( users[ TOKEN_OWNER ].address, holder.address, test_data.TARGET_TOKEN )

								expect(
									await contract.ownerOf( tokenId )
								).to.equal( to )

								expect(
									await contract.balanceOf( to )
								).to.equal( 1 )
							})

							it( 'To a receiver contract returning unexpected value should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async function () {
								const retval = CST.INTERFACE_ID.IERC165
								const error  = Error.None
								const holder_params = [
									retval,
									error
								]
								const invalidReceiver = await deployContract( users[ CONTRACT_DEPLOYER ], HOLDER_ARTIFACT, holder_params )

								const from    = users[ TOKEN_OWNER ].address
								const to      = invalidReceiver.address
								const tokenId = test_data.TARGET_TOKEN
								const data    = '0x'

								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
								).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
							})

							it( 'To a receiver contract that reverts with error should be reverted with ' + ERROR.ERC721Receiver_ERROR, async function () {
								const retval = CST.INTERFACE_ID.IERC721Receiver
								const error  = Error.RevertWithError
								const holder_params = [
									retval,
									error
								]
								const invalidReceiver = await deployContract( users[ CONTRACT_DEPLOYER ], HOLDER_ARTIFACT, holder_params )

								const from    = users[ TOKEN_OWNER ].address
								const to      = invalidReceiver.address
								const tokenId = test_data.TARGET_TOKEN
								const data    = '0x'

								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
								).to.be.revertedWith( ERROR.ERC721Receiver_ERROR )
							})

							it( 'To a receiver contract that reverts with message should be reverted with ' + ERROR.ERC721Receiver_MESSAGE, async function () {
								const retval = CST.INTERFACE_ID.IERC721Receiver
								const error  = Error.RevertWithMessage
								const holder_params = [
									retval,
									error
								]
								const invalidReceiver = await deployContract( users[ CONTRACT_DEPLOYER ], HOLDER_ARTIFACT, holder_params )

								const from    = users[ TOKEN_OWNER ].address
								const to      = invalidReceiver.address
								const tokenId = test_data.TARGET_TOKEN
								const data    = '0x'

								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
								).to.be.revertedWith( ERROR.ERC721Receiver_MESSAGE )
							})

							it( 'To a receiver contract that reverts without message should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async function () {
								const retval = CST.INTERFACE_ID.IERC721Receiver
								const error  = Error.RevertWithoutMessage
								const holder_params = [
									retval,
									error
								]
								const invalidReceiver = await deployContract( users[ CONTRACT_DEPLOYER ], HOLDER_ARTIFACT, holder_params )

								const from    = users[ TOKEN_OWNER ].address
								const to      = invalidReceiver.address
								const tokenId = test_data.TARGET_TOKEN
								const data    = '0x'

								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
								).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
							})

							it( 'To a receiver contract that panics should be reverted with ' + ERROR.PANIC, async function () {
								const retval = CST.INTERFACE_ID.IERC721Receiver
								const error  = Error.Panic
								const holder_params = [
									retval,
									error
								]
								const invalidReceiver = await deployContract( users[ CONTRACT_DEPLOYER ], HOLDER_ARTIFACT, holder_params )

								const from    = users[ TOKEN_OWNER ].address
								const to      = invalidReceiver.address
								const tokenId = test_data.TARGET_TOKEN
								const data    = '0x'

								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( from, to, tokenId, data )
								).to.be.revertedWith( ERROR.PANIC )
							})
						})
					}
				})

				describe( CONTRACT.METHODS.setApprovalForAll.SIGNATURE, function () {
					if( TEST.METHODS.setApprovalForAll ) {
						it( 'Trying to allow self should be reverted with ' + ERROR.IERC721_APPROVE_CALLER, async function () {
							const operator = users[ USER1 ].address
							const approved = true
							await expect(
								contract.connect( users[ USER1 ] )
												.setApprovalForAll( operator, approved )
							).to.be.revertedWith( ERROR.IERC721_APPROVE_CALLER )
						})

						describe( 'Allowing another user to trade owned tokens', function () {
							beforeEach( async function () {
								const owner    = users[ TOKEN_OWNER ].address
								const operator = users[ USER1 ].address
								const approved = true
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.setApprovalForAll( operator, approved )
								).to.emit( contract, CONTRACT.EVENTS.ApprovalForAll )
										.withArgs( owner, operator, approved )
							})

							it( USER_NAMES[ USER1 ] + ' should now be allowed to trade tokens owned by ' + USER_NAMES[ TOKEN_OWNER ], async function () {
								tokenOwner = users[ TOKEN_OWNER ].address
								operator   = users[ USER1 ].address
								expect(
									await contract.isApprovedForAll( tokenOwner, operator )
								).to.be.true
							})

							// describe( USER_NAMES[ USER1 ] + ' transfering token ' + test_data.TARGET_TOKEN + ' owned by ' + USER_NAMES[ TOKEN_OWNER ], async function () {
							// 	describe( 'To ' + USER_NAMES[ TOKEN_OWNER ], async function () {
							// 		it( USER_NAMES[ USER1 ] + ' should now own token ' + test_data.TARGET_TOKEN, async function () {
							// 			await contract.connect( users[ USER1 ] ).transferFrom( users[ TOKEN_OWNER ].address, users[ TOKEN_OWNER ].address, test_data.TARGET_TOKEN )
							// 			expect(
							// 				await contract.ownerOf( test_data.TARGET_TOKEN ) ).equal( users[ TOKEN_OWNER ].address )
							// 		})
							// 	})

							// 	describe( 'To themselves', async function () {
							// 		it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + test_data.TARGET_TOKEN + ' was transfered from ' + USER_NAMES[ TOKEN_OWNER ] + ' to ' + USER_NAMES[ USER1 ], async function () {
							// 			await expect(
							// 				contract.connect( users[ USER1 ] ).transferFrom( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.TARGET_TOKEN )
							// 			).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.TARGET_TOKEN )
							// 		})

							// 		it( USER_NAMES[ USER1 ] + ' should now own token ' + test_data.TARGET_TOKEN, async function () {
							// 			await contract.connect( users[ USER1 ] ).transferFrom( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.TARGET_TOKEN )
							// 			expect(
							// 				await contract.ownerOf( test_data.TARGET_TOKEN ) ).equal( users[ USER1 ].address )
							// 		})
							// 	})

							// 	describe( 'To other user', async function () {
							// 		it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + test_data.TARGET_TOKEN + ' was transfered from ' + USER_NAMES[ TOKEN_OWNER ] + ' to ' + USER_NAMES[ USER2 ], async function () {
							// 			await expect(
							// 				contract.connect( users[ USER1 ] ).transferFrom( users[ TOKEN_OWNER ].address, users[ USER2 ].address, test_data.TARGET_TOKEN )
							// 			).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( users[ TOKEN_OWNER ].address, users[ USER2 ].address, test_data.TARGET_TOKEN )
							// 		})

							// 		it( USER_NAMES[ USER2 ] + ' should now own token ' + test_data.TARGET_TOKEN, async function () {
							// 			await contract.connect( users[ USER1 ] ).transferFrom( users[ TOKEN_OWNER ].address, users[ USER2 ].address, test_data.TARGET_TOKEN )
							// 			expect(
							// 				await contract.ownerOf( test_data.TARGET_TOKEN ) ).equal( users[ USER2 ].address )
							// 		})
							// 	})
							// })

							// describe( USER_NAMES[ USER1 ] + ' safe transfering token ' + test_data.TARGET_TOKEN + ' owned by ' + USER_NAMES[ TOKEN_OWNER ], async function () {
							// 	describe( 'To ' + USER_NAMES[ TOKEN_OWNER ], async function () {
							// 		it( USER_NAMES[ USER1 ] + ' should now own token ' + test_data.TARGET_TOKEN, async function () {
							// 			await contract.connect( users[ USER1 ] ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( users[ TOKEN_OWNER ].address, users[ TOKEN_OWNER ].address, test_data.TARGET_TOKEN )
							// 			expect(
							// 				await contract.ownerOf( test_data.TARGET_TOKEN ) ).equal( users[ TOKEN_OWNER ].address )
							// 		})
							// 	})

							// 	describe( 'To themselves', async function () {
							// 		it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + test_data.TARGET_TOKEN + ' was transfered from ' + USER_NAMES[ TOKEN_OWNER ] + ' to ' + USER_NAMES[ USER2 ], async function () {
							// 			await expect(
							// 				contract.connect( users[ USER1 ] ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.TARGET_TOKEN )
							// 			).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.TARGET_TOKEN )
							// 		})

							// 		it( USER_NAMES[ USER1 ] + ' should now own token ' + test_data.TARGET_TOKEN, async function () {
							// 			await contract.connect( users[ USER1 ] ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.TARGET_TOKEN )
							// 			expect(
							// 				await contract.ownerOf( test_data.TARGET_TOKEN ) ).equal( users[ USER1 ].address )
							// 		})
							// 	})

							// 	describe( 'To other user', async function () {
							// 		it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + test_data.TARGET_TOKEN + ' was transfered from ' + USER_NAMES[ TOKEN_OWNER ] + ' to ' + USER_NAMES[ USER2 ], async function () {
							// 			await expect(
							// 				contract.connect( users[ USER1 ] ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.TARGET_TOKEN )
							// 			).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.TARGET_TOKEN )
							// 		})

							// 		it( USER_NAMES[ USER1 ] + ' should now own token ' + test_data.TARGET_TOKEN, async function () {
							// 			await contract.connect( users[ USER1 ] ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.TARGET_TOKEN )
							// 			expect(
							// 				await contract.ownerOf( test_data.TARGET_TOKEN ) ).equal( users[ USER1 ].address )
							// 		})
							// 	})
							// })

							describe( 'Removing approval for other user to trade owned tokens', function () {
								beforeEach( async function () {
									const owner    = users[ TOKEN_OWNER ].address
									const operator = users[ USER1       ].address
									const approved = false
									await expect(
										contract.connect( users[ TOKEN_OWNER ] )
														.setApprovalForAll( operator, approved )
									).to.emit( contract, CONTRACT.EVENTS.ApprovalForAll )
											.withArgs( owner, operator, approved )
								})

								it( USER_NAMES[ USER1 ] + ' should not be allowed to trade tokens owned by ' + USER_NAMES[ TOKEN_OWNER ] + ' anymore', async function () {
									const owner    = users[ TOKEN_OWNER ].address
									const operator = users[ USER1       ].address
									expect(
										await contract.isApprovedForAll( owner, operator )
									).to.be.false
								})
							})
						})
					}
				})

				describe( CONTRACT.METHODS.transferFrom.SIGNATURE, function () {
					if( TEST.METHODS.transferFrom ) {
						it( 'Should be reverted when requested token does not exist', async function () {
							const from    = users[ TOKEN_OWNER ].address
							const to      = users[ USER1       ].address
							const tokenId = test_data.UNMINTED_TOKEN
							await shouldRevertWhenRequestedTokenDoesNotExist(
								contract.connect( users[ TOKEN_OWNER ] )
												.transferFrom( from, to, tokenId )
							)
						})

						it( 'Trying to transfer token ' + test_data.TARGET_TOKEN + ' not owned should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async function () {
							const from    = users[ TOKEN_OWNER ].address
							const to      = users[ USER1       ].address
							const tokenId = test_data.TARGET_TOKEN
							await shouldRevertWhenCallerIsNotApproved(
								contract.connect( users[ USER1 ] )
												.transferFrom( from, to, tokenId )
							)
						})

						it( USER_NAMES[ TOKEN_OWNER ] + ' transfering token ' + test_data.FIRST_TOKEN + ' owned', async function () {
							const from    = users[ TOKEN_OWNER ].address
							const to      = users[ USER1       ].address
							const tokenId = test_data.FIRST_TOKEN
							await expect(
								contract.connect( users[ TOKEN_OWNER ] )
												.transferFrom( from, to, tokenId )
							).to.emit( contract, CONTRACT.EVENTS.Transfer )
									.withArgs( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.FIRST_TOKEN )
						})

						describe( USER_NAMES[ TOKEN_OWNER ] + ' transfering token ' + test_data.TARGET_TOKEN + ' owned', function () {
							it( 'To the NULL address should be reverted with ' + ERROR.IERC721_NULL_ADDRESS_TRANSFER, async function () {
								const from    = users[ TOKEN_OWNER ].address
								const to      = CST.ADDRESS_ZERO
								const tokenId = test_data.TARGET_TOKEN
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.transferFrom( from, to, tokenId )
								).to.be.revertedWith( ERROR.IERC721_NULL_ADDRESS_TRANSFER )
							})

							describe( 'To non ERC721Receiver contract should not be reverted', async function () {
								const non_holder = await deployContract( users[ CONTRACT_DEPLOYER ], NON_HOLDER_ARTIFACT, [] )
								const from    = users[ TOKEN_OWNER ].address
								const to      = non_holder.address
								const tokenId = test_data.TARGET_TOKEN
								await contract.connect( users[ TOKEN_OWNER ] )
															.transferFrom( from, to, tokenId )

								expect(
									await contract.ownerOf( test_data.TARGET_TOKEN )
								).to.equal( non_holder.address )
							})

							describe( 'To other user', function () {
								beforeEach( async function () {
									const from    = users[ TOKEN_OWNER ].address
									const to      = users[ USER1       ].address
									const tokenId = test_data.TARGET_TOKEN
									await expect(
										contract.connect( users[ TOKEN_OWNER ] )
														.transferFrom( from, to, tokenId )
									).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( users[ TOKEN_OWNER ].address, users[ USER1 ].address, test_data.TARGET_TOKEN )
								})

								it( 'Token ' + test_data.TARGET_TOKEN + ' owner should now be ' + USER_NAMES[ USER1 ], async function () {
									const tokenId = test_data.TARGET_TOKEN
									expect(
										await contract.ownerOf( tokenId )
									).to.equal( users[ USER1 ].address )
								})

								it( 'Balance of ' + USER_NAMES[ TOKEN_OWNER ] + ' should now be ' + ( test_data.TOKEN_OWNER_SUPPLY - 1 ).toString(), async function () {
									const tokenOwner = users[ TOKEN_OWNER ].address
									expect(
										await contract.balanceOf( tokenOwner )
									).to.equal( test_data.TOKEN_OWNER_SUPPLY - 1 )
								})

								it( 'Balance of ' + USER_NAMES[ USER1 ] + ' should now be 1', async function () {
									const tokenOwner = users[ USER1 ].address
									expect(
										await contract.balanceOf( tokenOwner )
									).to.equal( 1 )
								})

								it( 'Approved address for token ' + test_data.TARGET_TOKEN + ' should be the NULL address', async function () {
									const tokenId = test_data.TARGET_TOKEN
									expect(
										await contract.getApproved( tokenId )
									).to.equal( CST.ADDRESS_ZERO )
								})
							})
						})
					}
				})
			}
		})
	}
// **************************************

// **************************************
// *****           EXPORT           *****
// **************************************
module.exports = {
	shouldRevertWhenRequestedTokenDoesNotExist,
	shouldRevertWhenCallerIsNotApproved,
	shouldBehaveLikeERC721BaseBeforeMint,
	shouldBehaveLikeERC721BaseAfterMint,
}
