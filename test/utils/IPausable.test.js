const ARTIFACT = require( '../../artifacts/contracts/mocks/utils/Mock_IPausable.sol/Mock_IPausable.json' )
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
	shouldBehaveLikeIPausable,
	shouldRevertWhenSaleStateIsNotClose,
	shouldRevertWhenSaleStateIsNotPreSale,
	shouldRevertWhenSaleStateIsNotSale,
} = require( '../utils/behavior.IPausable' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IPausable',
	EVENTS : {
		SaleStateChanged : true,
	},
	METHODS : {
		saleState     : true,
		setSaleState  : true,
		saleIsClosed  : true,
		presaleIsOpen : true,
		saleIsOpen    : true,
	},
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_IPausable',
	METHODS : {
		saleState            : {
			SIGNATURE          : 'saleState()',
			PARAMS             : [],
		},
		setSaleState         : {
			SIGNATURE          : 'setSaleState(uint8)',
			PARAMS             : [ 'newState_' ],
		},
		saleIsClosed         : {
			SIGNATURE          : 'saleIsClosed()',
			PARAMS             : [],
		},
		presaleIsOpen        : {
			SIGNATURE          : 'presaleIsOpen()',
			PARAMS             : [],
		},
		saleIsOpen           : {
			SIGNATURE          : 'saleIsOpen()',
			PARAMS             : [],
		},
	},
}

const TEST_DATA = {}

let test_contract_params

let contract
let users = {}

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

	test_contract_params = []
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
				defaultArgs [ CONTRACT.METHODS.saleState.SIGNATURE ] = {
					err  : null,
					args : [],
				}
				defaultArgs [ CONTRACT.METHODS.setSaleState.SIGNATURE ] = {
					err  : null,
					args : [
						CST.SALE_STATE.SALE,
					],
				}
				defaultArgs [ CONTRACT.METHODS.saleIsClosed.SIGNATURE ] = {
					err  : null,
					args : [],
				}
				defaultArgs [ CONTRACT.METHODS.presaleIsOpen.SIGNATURE ] = {
					err  : null,
					args : [],
				}
				defaultArgs [ CONTRACT.METHODS.saleIsOpen.SIGNATURE ] = {
					err  : null,
					args : [],
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

function shouldBehaveLikeMock_IPausable ( fixture, test_data ) {
	if ( TEST_ACTIVATION.CORRECT_INPUT ) {
		beforeEach( async function () {
			const {
				test_contract,
				test_contract_deployer,
			} = await loadFixture( fixture )

			contract = test_contract
			users[ CONTRACT_DEPLOYER ] = test_contract_deployer
		})

		describe( 'Initial state: CLOSED', function () {
			it( 'saleIsClosed should be fulfilled', async function () {
				expect(
					await contract.saleIsClosed()
				).to.be.true
			})

			it( 'presaleIsOpen should be reverted with ' + ERROR.IPausable_PRESALE_NOT_OPEN, async function () {
				await shouldRevertWhenSaleStateIsNotPreSale(
					contract.presaleIsOpen()
				)
			})

			it( 'saleIsOpen should be reverted with ' + ERROR.IPausable_SALE_NOT_OPEN, async function () {
				await shouldRevertWhenSaleStateIsNotSale(
					contract.saleIsOpen()
				)
			})
		})

		describe( 'Switch state: PRESALE', function () {
			beforeEach( async function () {
				const newState = CST.SALE_STATE.PRESALE
				await contract.connect( users[ CONTRACT_DEPLOYER ] )
											.setSaleState( newState )
			})

			it( 'saleIsClosed should be reverted with ' + ERROR.IPausable_SALE_NOT_CLOSED, async function () {
				await shouldRevertWhenSaleStateIsNotClose(
					contract.saleIsClosed()
				)
			})

			it( 'presaleIsOpen should be fulfilled', async function () {
				expect(
					await contract.presaleIsOpen()
				).to.be.true
			})

			it( 'saleIsOpen should be reverted with ' + ERROR.IPausable_SALE_NOT_OPEN, async function () {
				await shouldRevertWhenSaleStateIsNotSale(
					contract.saleIsOpen()
				)
			})
		})

		describe( 'Switch state: SALE', function () {
			beforeEach( async function () {
				const newState = CST.SALE_STATE.SALE
				await contract.connect( users[ CONTRACT_DEPLOYER ] )
											.setSaleState( newState )
			})

			it( 'saleIsClosed should be reverted with ' + ERROR.IPausable_SALE_NOT_CLOSED, async function () {
				await shouldRevertWhenSaleStateIsNotClose(
					contract.saleIsClosed()
				)
			})

			it( 'presaleIsOpen should be reverted with ' + ERROR.IPausable_PRESALE_NOT_OPEN, async function () {
				await shouldRevertWhenSaleStateIsNotPreSale(
					contract.presaleIsOpen()
				)
			})

			it( 'saleIsOpen should be fulfilled', async function () {
				expect(
					await contract.saleIsOpen()
				).to.be.true
			})
		})
	}
}

describe( TEST.NAME, function () {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		testInvalidInputs( fixture, TEST_DATA )
		shouldBehaveLikeMock_IPausable( fixture, TEST_DATA )
	}
})
