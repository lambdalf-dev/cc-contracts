const ARTIFACT = require( '../../artifacts/contracts/mocks/tokens/extensions/Mock_ERC721BatchEnumerable.sol/Mock_ERC721BatchEnumerable.json' )
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

	const {
		shouldBehaveLikeERC721BaseEnumerableBeforeMint,
		shouldBehaveLikeERC721BaseEnumerableAfterMint
	} = require( './behavior.ERC721BaseEnumerable' )
// **************************************

// **************************************
// *****       TEST VARIABLES       *****
// **************************************
	// For activating or de-activating test cases
	const TEST = {
		NAME : 'ERC721BatchEnumerable',
		METHODS : {
			totalSupply         : true,
			tokenOfOwnerByIndex : true,
			tokenByIndex        : true,
		},
	}

	// For contract data
	const CONTRACT = {
		NAME : 'Mock_ERC721BatchEnumerable',
		METHODS : {
			totalSupply          : {
				SIGNATURE          : 'totalSupply()',
				PARAMS             : [],
			},
			tokenOfOwnerByIndex  : {
				SIGNATURE          : 'tokenOfOwnerByIndex(address,uint256)',
				PARAMS             : [ 'tokenOwner_', 'index_' ],
			},
			tokenByIndex         : {
				SIGNATURE          : 'tokenByIndex(uint256)',
				PARAMS             : [ 'index_' ],
			},
		},
	}

	// SUPPLY
	const INIT_SUPPLY             = 0
	// TARGET TOKEN
	const FIRST_TOKEN             = 0
	const SECOND_TOKEN            = 1
	const TARGET_TOKEN            = 3
	// TOKEN OWNER
	const TOKEN_OWNER_INIT_SUPPLY = 6
	const TOKEN_OWNER_MORE_SUPPLY = 3
	const TOKEN_OWNER_SUPPLY      = TOKEN_OWNER_INIT_SUPPLY + TOKEN_OWNER_MORE_SUPPLY
	const TOKEN_OWNER_FIRST       = FIRST_TOKEN
	const TOKEN_OWNER_LAST        = TOKEN_OWNER_FIRST + TOKEN_OWNER_INIT_SUPPLY - 1
	// OTHER OWNER
	const OTHER_OWNER_SUPPLY      = 1
	const OTHER_OWNER_FIRST       = TOKEN_OWNER_LAST + 1
	const OTHER_OWNER_LAST        = OTHER_OWNER_FIRST + OTHER_OWNER_SUPPLY - 1
	// NON EXISTENT
	const LAST_TOKEN              = FIRST_TOKEN + TOKEN_OWNER_SUPPLY + OTHER_OWNER_SUPPLY -1
	const UNMINTED_TOKEN          = TOKEN_OWNER_SUPPLY + OTHER_OWNER_SUPPLY + 10
	// METADATA
	const INIT_BASE_URI           = ''
	const NEW_BASE_URI            = 'https://exemple.com/api/'

	const TEST_DATA = {
		// SUPPLY
		INIT_SUPPLY                 : INIT_SUPPLY,
		MINTED_SUPPLY               : INIT_SUPPLY + TOKEN_OWNER_SUPPLY + OTHER_OWNER_SUPPLY,
		// TARGET TOKEN
		FIRST_TOKEN                 : INIT_SUPPLY + FIRST_TOKEN,
		SECOND_TOKEN                : INIT_SUPPLY + SECOND_TOKEN,
		TARGET_TOKEN                : INIT_SUPPLY + TARGET_TOKEN,
		LAST_TOKEN                  : INIT_SUPPLY + LAST_TOKEN,
		UNMINTED_TOKEN              : INIT_SUPPLY + UNMINTED_TOKEN,
		// TOKEN OWNER
		TOKEN_OWNER_INIT_SUPPLY     : TOKEN_OWNER_INIT_SUPPLY,
		TOKEN_OWNER_MORE_SUPPLY     : TOKEN_OWNER_MORE_SUPPLY,
		TOKEN_OWNER_SUPPLY          : TOKEN_OWNER_SUPPLY,
		TOKEN_OWNER_FIRST           : INIT_SUPPLY + FIRST_TOKEN,
		TOKEN_OWNER_LAST            : INIT_SUPPLY + LAST_TOKEN,
		TOKEN_OWNER_MID             : TOKEN_OWNER_INIT_SUPPLY + OTHER_OWNER_SUPPLY + 1,
		// OTHER OWNER
		OTHER_OWNER_SUPPLY          : OTHER_OWNER_SUPPLY,
		OTHER_OWNER_FIRST           : INIT_SUPPLY + OTHER_OWNER_FIRST,
		OTHER_OWNER_LAST            : INIT_SUPPLY + OTHER_OWNER_LAST,
		// METADATA
		INIT_BASE_URI               : INIT_BASE_URI,
		NEW_BASE_URI                : NEW_BASE_URI,
		// ENUMERABLE
		INDEX_ZERO                  : 0,
		INDEX_SECOND                : TOKEN_OWNER_INIT_SUPPLY + OTHER_OWNER_SUPPLY,
		TARGET_INDEX                : INIT_SUPPLY + TARGET_TOKEN,
		OUT_OF_BOUNDS_INDEX         : INIT_SUPPLY + UNMINTED_TOKEN,
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
			'IERC721Enumerable',
		],
	}

	let test_qty
	let test_accounts
	let test_tx_params
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

		test_qty = TEST_DATA.TOKEN_OWNER_INIT_SUPPLY
		await test_contract.connect( test_token_owner )
											 .mint( test_qty )

		test_qty = TEST_DATA.OTHER_OWNER_SUPPLY
		await test_contract.connect( test_other_owner )
											 .mint( test_qty )

		test_qty = TEST_DATA.TOKEN_OWNER_MORE_SUPPLY
		await test_contract.connect( test_token_owner )
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
		describe( 'Test invalid inputs', function () {
			if ( TEST_ACTIVATION.INVALID_INPUT ) {
				beforeEach( async function () {
					const {
						test_user1,
						test_user2,
						test_community,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer

					const proof = generateProof( users[ TOKEN_OWNER ].address, test_data.PASS_ROOT, test_data.TOKEN_OWNER_INIT_SUPPLY )

					defaultArgs = {}
					// **************************************
					// *****            VIEW            *****
					// **************************************
						defaultArgs[ CONTRACT.METHODS.tokenByIndex.SIGNATURE ] = {
							err  : null,
							args : [
								0,
							],
						}
						defaultArgs[ CONTRACT.METHODS.tokenOfOwnerByIndex.SIGNATURE ] = {
							err  : null,
							args : [
								users[ TOKEN_OWNER ].address,
								0,
							],
						}
						defaultArgs[ CONTRACT.METHODS.totalSupply.SIGNATURE ] = {
							err  : null,
							args : [],
						}
					// **************************************
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
// **************************************

// **************************************
// *****          TEST RUN          *****
// **************************************
describe( TEST.NAME, function () {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		testInvalidInputs( noMintFixture, TEST_DATA )
		shouldSupportInterface( noMintFixture, TEST_DATA.INTERFACES )
		shouldBehaveLikeERC721BaseBeforeMint( noMintFixture, TEST_DATA )
		shouldBehaveLikeERC721BaseEnumerableBeforeMint( noMintFixture, TEST_DATA )
		shouldBehaveLikeERC721BaseAfterMint( mintFixture, TEST_DATA )
		shouldBehaveLikeERC721BaseMetadata( mintFixture, TEST_DATA )
		shouldBehaveLikeERC721BaseEnumerableAfterMint( mintFixture, TEST_DATA )
	}
})
