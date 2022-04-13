const ARTIFACT = require( '../../artifacts/contracts/mocks/tokens/Mock_ERC721Batch.sol/Mock_ERC721Batch.json' )
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

	const {
		shouldSupportInterface,
	} = require( '../utils/behavior.ERC165' )

	const {
		shouldRevertWhenRequestedTokenDoesNotExist,
		shouldRevertWhenCallerIsNotApproved,
		shouldBehaveLikeERC721BaseBeforeMint,
		shouldBehaveLikeERC721BaseAfterMint,
	} = require( '../ERC721/behavior.ERC721Base' )

	const {
		shouldBehaveLikeERC721BaseMetadata,
	} = require( '../ERC721/behavior.ERC721BaseMetadata' )
// **************************************

// **************************************
// *****       TEST VARIABLES       *****
// **************************************
	// For activating or de-activating test cases
	const TEST = {
		NAME : 'ERC721Batch',
		EVENTS : {
			Approval            : true,
			ApprovalForAll      : true,
			ConsecutiveTransfer : true,
			Transfer            : true,
		},
		METHODS : {
			balanceOf         : true,
			getApproved       : true,
			isApprovedForAll  : true,
			name              : true,
			ownerOf           : true,
			symbol            : true,
			tokenURI          : true,
			approve           : true,
			mint              : true,
			safeTransferFrom  : true,
			setApprovalForAll : true,
			setBaseURI        : true,
			transferFrom      : true,
		},
	}

	// For contract data
	const CONTRACT = {
		NAME : 'Mock_ERC721Batch',
		EVENTS : {
			Approval            : 'Approval',
			ApprovalForAll      : 'ApprovalForAll',
			ConsecutiveTransfer : 'ConsecutiveTransfer',
			Transfer            : 'Transfer',
		},
		METHODS : {
			balanceOf            : {
				SIGNATURE          : 'balanceOf(address)',
				PARAMS             : [ 'tokenOwner_' ],
			},
			getApproved          : {
				SIGNATURE          : 'getApproved(uint256)',
				PARAMS             : [ 'tokenId_' ],
			},
			isApprovedForAll     : {
				SIGNATURE          : 'isApprovedForAll(address,address)',
				PARAMS             : [ 'tokenOwner_', 'operator_' ],
			},
			name                 : {
				SIGNATURE          : 'name()',
				PARAMS             : [],
			},
			ownerOf              : {
				SIGNATURE          : 'ownerOf(uint256)',
				PARAMS             : [ 'tokenId_' ],
			},
			supportsInterface    : {
				SIGNATURE          : 'supportsInterface(bytes4)',
				PARAMS             : [ 'interfaceId_' ],
			},
			symbol               : {
				SIGNATURE          : 'symbol()',
				PARAMS             : [],
			},
			tokenURI             : {
				SIGNATURE          : 'tokenURI(uint256)',
				PARAMS             : [ 'index_' ],
			},
			approve              : {
				SIGNATURE          : 'approve(address,uint256)',
				PARAMS             : [ 'to_', 'tokenId_' ],
			},
			mint                 : {
				SIGNATURE          : 'mint(uint256)',
				PARAMS             : [ 'qty_' ],
			},
			safeTransferFrom     : {
				SIGNATURE          : 'safeTransferFrom(address,address,uint256)',
				PARAMS             : [ 'from_', 'to_', 'tokenId_' ],
			},
			safeTransferFrom_ol  : {
				SIGNATURE          : 'safeTransferFrom(address,address,uint256,bytes)',
				PARAMS             : [ 'from_', 'to_', 'tokenId_', 'data_' ],
			},
			setApprovalForAll    : {
				SIGNATURE          : 'setApprovalForAll(address,bool)',
				PARAMS             : [ 'operator_', 'approved_' ],
			},
			setBaseURI           : {
				SIGNATURE          : 'setBaseURI(string)',
				PARAMS             : [ 'baseURI' ],
			},
			transferFrom         : {
				SIGNATURE          : 'transferFrom(address,address,uint256)',
				PARAMS             : [ 'from_', 'to_', 'tokenId_' ],
			},
		},
	}

	const INIT_SUPPLY        = CST.INIT_SUPPLY
	const MINTED_SUPPLY      = CST.MINTED_SUPPLY
	const FIRST_TOKEN        = CST.FIRST_TOKEN
	const SECOND_TOKEN       = CST.SECOND_TOKEN
	const TARGET_TOKEN       = CST.TARGET_TOKEN
	const UNMINTED_TOKEN     = CST.UNMINTED_TOKEN
	const TOKEN_OWNER_LAST   = CST.TOKEN_OWNER_LAST
	const TOKEN_OWNER_FIRST  = CST.TOKEN_OWNER_FIRST
	const TOKEN_OWNER_SUPPLY = CST.TOKEN_OWNER_SUPPLY
	const OTHER_OWNER_LAST   = CST.OTHER_OWNER_LAST
	const OTHER_OWNER_FIRST  = CST.OTHER_OWNER_FIRST
	const OTHER_OWNER_SUPPLY = CST.OTHER_OWNER_SUPPLY
	const INIT_BASE_URI      = CST.DEFAULT_BASE_URI
	const NEW_BASE_URI       = CST.NEW_BASE_URI

	const TEST_DATA = {
		// SUPPLY
		INIT_SUPPLY        : INIT_SUPPLY,
		MINTED_SUPPLY      : MINTED_SUPPLY + INIT_SUPPLY,
		// TARGET TOKEN
		FIRST_TOKEN        : FIRST_TOKEN,
		SECOND_TOKEN       : SECOND_TOKEN,
		TARGET_TOKEN       : TARGET_TOKEN + INIT_SUPPLY,
		UNMINTED_TOKEN     : UNMINTED_TOKEN + INIT_SUPPLY,
		// TOKEN OWNER
		TOKEN_OWNER_SUPPLY : TOKEN_OWNER_SUPPLY,
		TOKEN_OWNER_FIRST  : TOKEN_OWNER_FIRST + INIT_SUPPLY,
		TOKEN_OWNER_LAST   : TOKEN_OWNER_LAST + INIT_SUPPLY,
		// OTHER OWNER
		OTHER_OWNER_SUPPLY : OTHER_OWNER_SUPPLY,
		OTHER_OWNER_FIRST  : OTHER_OWNER_FIRST + INIT_SUPPLY,
		OTHER_OWNER_LAST   : OTHER_OWNER_LAST + INIT_SUPPLY,
		// METADATA
		INIT_BASE_URI      : INIT_BASE_URI,
		NEW_BASE_URI       : NEW_BASE_URI,
		// CONSTRUCTOR PARAMETERS
		PARAMS : {
			qty_    : INIT_SUPPLY,
			name_   : 'NFT Token',
			symbol_ : 'NFT',
		},
		// INTERFACES
		INTERFACES : [
			'IERC165',
			'IERC721',
			'IERC721Metadata',
		],
	}

	let test_qty
	let test_contract_params

	let users = {}
	let contract
// **************************************

// **************************************
// *****          FIXTURES          *****
// **************************************
	async function noMintFixture() {
		[
			test_user1,
			test_user2,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_contract_params = [
			TEST_DATA.PARAMS.qty_,
			TEST_DATA.PARAMS.name_,
			TEST_DATA.PARAMS.symbol_,
		]
		let test_contract = await deployContract( test_contract_deployer, ARTIFACT, test_contract_params )
		await test_contract.deployed()

		return {
			test_user1,
			test_user2,
			test_contract,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
		}
	}

	async function mintFixture() {
		[
			test_user1,
			test_user2,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_contract_params = [
			TEST_DATA.PARAMS.qty_,
			TEST_DATA.PARAMS.name_,
			TEST_DATA.PARAMS.symbol_
		]
		let test_contract = await deployContract( test_contract_deployer, ARTIFACT, test_contract_params )
		await test_contract.deployed()

		test_qty = CST.TOKEN_OWNER_SUPPLY
		await test_contract.connect( test_token_owner )
											 .mint( test_qty )

		test_qty = CST.OTHER_OWNER_SUPPLY
		await test_contract.connect( test_other_owner )
											 .mint( test_qty )

		return {
			test_user1,
			test_user2,
			test_contract,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
		}
	}
// **************************************

// **************************************
// *****        TEST  SUITES        *****
// **************************************
	function testInvalidInputs ( fixture, test_data ) {
		describe( 'Invalid inputs', function () {
			if ( TEST_ACTIVATION.INVALID_INPUT ) {
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

					defaultArgs = {}
					defaultArgs[ CONTRACT.METHODS.balanceOf.SIGNATURE ] = {
						err  : null,
						args : [
							users[ TOKEN_OWNER ].address,
						],
					}
					defaultArgs[ CONTRACT.METHODS.getApproved.SIGNATURE ] = {
						err  : null,
						args : [
							0,
						],
					}
					defaultArgs[ CONTRACT.METHODS.isApprovedForAll.SIGNATURE ] = {
						err  : null,
						args : [
							users[ TOKEN_OWNER ].address,
							users[ USER1 ].address,
						],
					}
					defaultArgs[ CONTRACT.METHODS.name.SIGNATURE ] = {
						err  : null,
						args : [],
					}
					defaultArgs[ CONTRACT.METHODS.ownerOf.SIGNATURE ] = {
						err  : null,
						args : [
							0,
						],
					}
					defaultArgs[ CONTRACT.METHODS.supportsInterface.SIGNATURE ] = {
						err  : null,
						args : [
							CST.INTERFACE_ID.IERC165,
						]
					}
					defaultArgs[ CONTRACT.METHODS.symbol.SIGNATURE ] = {
						err  : null,
						args : [],
					}
					defaultArgs[ CONTRACT.METHODS.tokenURI.SIGNATURE ] = {
						err  : null,
						args : [
							0,
						],
					}
					defaultArgs[ CONTRACT.METHODS.approve.SIGNATURE ] = {
						err  : null,
						args : [
							users[ USER1 ].address,
							0,
						],
					}
					defaultArgs [ CONTRACT.METHODS.mint.SIGNATURE ] = {
						err  : null,
						args : [
							5,
						],
					}
					defaultArgs[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ] = {
						err  : null,
						args : [
							users[ TOKEN_OWNER ].address,
							users[ USER1 ].address,
							0,
						],
					}
					defaultArgs[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ] = {
						err  : null,
						args : [
							users[ TOKEN_OWNER ].address,
							users[ USER1 ].address,
							0,
							'0x',
						],
					}
					defaultArgs[ CONTRACT.METHODS.setApprovalForAll.SIGNATURE ] = {
						err  : null,
						args : [
							users[ TOKEN_OWNER ].address,
							true,
						],
					}
					defaultArgs[ CONTRACT.METHODS.setBaseURI.SIGNATURE ] = {
						err  : null,
						args : [
							test_data.NEW_BASE_URI,
						],
					}
					defaultArgs[ CONTRACT.METHODS.transferFrom.SIGNATURE ] = {
						err  : null,
						args : [
							users[ TOKEN_OWNER ].address,
							users[ USER1 ].address,
							0,
						],
					}
				})

				Object.entries( CONTRACT.METHODS ).forEach( function( [ prop, val ] ) {
					describe( val.SIGNATURE, function () {
						const testSuite = getTestCasesByFunction( val.SIGNATURE, val.PARAMS )

						testSuite.forEach( testCase => {
							it( testCase.test_description, async function () {
								await generateTestCase( contract, testCase, defaultArgs, prop, val )
							})
						})
					})
				})
			}
		})
	}

	function shouldBehaveLikeMock_ERC721Batch ( fixture, test_data ) {
		describe( 'Should behave like Mock_ERC721Batch', function () {
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

				describe( CONTRACT.METHODS.setBaseURI.SIGNATURE, function () {
					if ( TEST.METHODS.setBaseURI ) {
						it( 'First token URI should now be "' + test_data.NEW_BASE_URI + test_data.FIRST_TOKEN + '"', async function () {
							const baseURI = test_data.NEW_BASE_URI
							await contract.connect( users[ CONTRACT_DEPLOYER ] )
														.setBaseURI( baseURI )

							const tokenId = test_data.FIRST_TOKEN
							expect(
								await contract.tokenURI( tokenId )
							).to.equal( baseURI + tokenId )
						})
					}
				})
			}
		})
	}
// **************************************

// **************************************
// *****          TEST RUN          *****
// **************************************
describe( TEST.NAME, function () {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		testInvalidInputs( noMintFixture, TEST_DATA )
		shouldSupportInterface( noMintFixture, TEST_DATA.INTERFACES )
		shouldBehaveLikeERC721BaseBeforeMint( noMintFixture, TEST_DATA )
		shouldBehaveLikeERC721BaseAfterMint( mintFixture, TEST_DATA )
		shouldBehaveLikeERC721BaseMetadata( mintFixture, TEST_DATA )
		shouldBehaveLikeMock_ERC721Batch( mintFixture, TEST_DATA )
	}
})
