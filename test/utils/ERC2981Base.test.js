const ARTIFACT = require( '../../artifacts/contracts/mocks/utils/Mock_ERC2981Base.sol/Mock_ERC2981Base.json' )
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
const expect = chai.expect ;

const { ethers, waffle } = require( 'hardhat' )
const { loadFixture, deployContract } = waffle

const { getTestCasesByFunction, generateTestCase } = require( '../fail-test-module' )

const {
	shouldSupportInterface
} = require( '../utils/behavior.ERC165' )

const {
	shouldBehaveLikeERC2981Base,
} = require( '../utils/behavior.ERC2981Base' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC2981Base',
	METHODS : {
		royaltyInfo       : true,
		setRoyaltyInfo    : true,
	},
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC2981Base',
	METHODS : {
		royaltyInfo          : {
			SIGNATURE          : 'royaltyInfo(uint256,uint256)',
			PARAMS             : [ 'tokenId_', 'salePrice_' ],
		},
		supportsInterface    : {
			SIGNATURE          : 'supportsInterface(bytes4)',
			PARAMS             : [ 'interfaceId_' ],
		},
		setRoyaltyInfo       : {
			SIGNATURE          : 'setRoyaltyInfo(address,uint256)',
			PARAMS             : [ 'recipient_', 'royaltyRate_' ],
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
		royaltyRate_ : 1000,
	},
	// INTERFACES
	INTERFACES : [
		'IERC165',
		'IERC2981',
	],
}

let test_qty
let test_contract_params

let users = {}
let contract

async function fixture() {
	[
		test_user1,
		test_user2,
		test_proxy_user,
		test_token_owner,
		test_other_owner,
		test_contract_deployer,
		...addrs
	] = await ethers.getSigners()

	const params = [
		test_contract_deployer.address,
		TEST_DATA.PARAMS.royaltyRate_
	]
	let test_contract = await deployContract( test_contract_deployer, ARTIFACT, params )
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
				defaultArgs [ CONTRACT.METHODS.royaltyInfo.SIGNATURE ] = {
					err  : null,
					args : [
						0,
						CST.ONE_ETH,
					],
				}
				defaultArgs[ CONTRACT.METHODS.supportsInterface.SIGNATURE ] = {
					err  : null,
					args : [
						CST.INTERFACE_ID.IERC165,
					]
				}
				defaultArgs [ CONTRACT.METHODS.setRoyaltyInfo.SIGNATURE ] = {
					err  : null,
					args : [
						users[ CONTRACT_DEPLOYER ].address,
						test_data.PARAMS.royaltyRate_,
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

describe( TEST.NAME, function () {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		testInvalidInputs( fixture, TEST_DATA )
		shouldSupportInterface( fixture, TEST_DATA.INTERFACES )
		shouldBehaveLikeERC2981Base( fixture, TEST_DATA )
	}
})
