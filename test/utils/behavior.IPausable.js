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
const { loadFixture } = waffle

const { getTestCasesByFunction, generateTestCase } = require( '../fail-test-module' )

// For activating or de-activating test cases
const TEST = {
	EVENTS : {
		SaleStateChanged : true,
	},
	METHODS : {
		saleState    : true,
		setSaleState : true,
	},
}

// For contract data
const CONTRACT = {
	EVENTS : {
		SaleStateChanged : 'SaleStateChanged',
	},
	METHODS : {
		saleState     : {
			SIGNATURE : 'saleState()',
			PARAMS    : [],
		},
		setSaleState  : {
			SIGNATURE : 'setSaleState(uint8)',
			PARAMS    : [ 'newState_' ],
		},
	},
}

let contract
let users = {}

async function shouldRevertWhenSaleStateIsNotClose ( promise ) {
	await expect( promise ).to.be.revertedWith( ERROR.IPausable_SALE_NOT_CLOSED )
}

async function shouldRevertWhenSaleStateIsNotPreSale ( promise ) {
	await expect( promise ).to.be.revertedWith( ERROR.IPausable_PRESALE_NOT_OPEN )
}

async function shouldRevertWhenSaleStateIsNotSale ( promise ) {
	await expect( promise ).to.be.revertedWith( ERROR.IPausable_SALE_NOT_OPEN )
}

function shouldBehaveLikeIPausable ( fixture, test_data ) {
	describe( 'Should behave like IPausable', function () {
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

			describe( 'Default sale state is CLOSED', function () {
				describe( CONTRACT.METHODS.saleState.SIGNATURE, function () {
					if ( TEST.METHODS.saleState ) {
						it( 'Should be ' + CST.SALE_STATE.CLOSED, async function () {
							expect(
								await contract.saleState()
							).to.equal( CST.SALE_STATE.CLOSED )
						})
					}
				})
			})

			describe( CONTRACT.METHODS.setSaleState.SIGNATURE, function () {
				if ( TEST.METHODS.setSaleState ) {
					it( 'Setting the sale state to PRESALE', async function () {
						const previousState = CST.SALE_STATE.CLOSE
						const newState      = CST.SALE_STATE.PRESALE
						await expect(
							contract.connect( users[ CONTRACT_DEPLOYER ] )
											.setSaleState( newState )
						).to.emit( contract, CONTRACT.EVENTS.SaleStateChanged )
								// .withArgs( previousState, newState )

						expect(
							await contract.saleState()
						).to.equal( newState )
					})

					it( 'Setting the sale state to SALE', async function () {
						const previousState = CST.SALE_STATE.CLOSE
						const newState      = CST.SALE_STATE.SALE
						await expect(
							contract.connect( users[ CONTRACT_DEPLOYER ] )
											.setSaleState( newState )
						).to.emit( contract, CONTRACT.EVENTS.SaleStateChanged )
								// .withArgs( previousState, newState )

						expect(
							await contract.saleState()
						).to.equal( newState )
					})
				}
			})
		}
	})
}

module.exports = {
	shouldBehaveLikeIPausable,
	shouldRevertWhenSaleStateIsNotClose,
	shouldRevertWhenSaleStateIsNotPreSale,
	shouldRevertWhenSaleStateIsNotSale,
}
