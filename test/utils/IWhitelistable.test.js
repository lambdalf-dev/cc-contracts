const ARTIFACT = require( '../../artifacts/contracts/mocks/utils/Mock_IWhitelistable.sol/Mock_IWhitelistable.json' )
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
	generateProof,
	shouldRevertWhenWitelistIsNotSet,
	shouldRevertWhenWhitelistIsConsumed,
	shouldRevertWhenNotWhitelisted,
} = require( '../utils/behavior.IWhitelistable' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IWhitelistable',
	METHODS : {
		setWhitelist            : true,
		checkWhitelistAllowance : true,
		consumeWhitelist        : true,
	},
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_IWhitelistable',
	METHODS : {
		setWhitelist            : {
			SIGNATURE             : 'setWhitelist(bytes32)',
			PARAMS                : [ 'root_' ],
		},
		checkWhitelistAllowance : {
			SIGNATURE             : 'checkWhitelistAllowance(address,bytes32,bool,uint256)',
			PARAMS                : [ 'account_', 'pass_', 'flag_', 'passMax_' ],
		},
		consumeWhitelist        : {
			SIGNATURE             : 'consumeWhitelist(address,bytes32,bool,uint256,uint256)',
			PARAMS                : [ 'account_', 'pass_', 'flag_', 'passMax_', 'qty_' ],
		},
	},
}

const PASS_MAX           = CST.PASS_MAX
const PASS_ROOT          = CST.PASS_ROOT

const TEST_DATA = {
	// WHITELIST
	PASS_MAX           : PASS_MAX,
	PASS_ROOT          : PASS_ROOT,
}

let test_root
let test_contract_params

let users = {}
let contract

async function noWhitelistFixture() {
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

async function whitelistFixture() {
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

	test_root = TEST_DATA.PASS_ROOT.toHexString()
	await test_contract.connect( test_contract_deployer )
										 .setWhitelist( test_root )

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

				const proof = generateProof( users[ TOKEN_OWNER ].address, test_data.PASS_ROOT, test_data.PASS_MAX )

				defaultArgs = {}
				defaultArgs [ CONTRACT.METHODS.setWhitelist.SIGNATURE ] = {
					err  : null,
					args : [
						test_data.PASS_ROOT.toHexString(),
					]
				}
				defaultArgs [ CONTRACT.METHODS.checkWhitelistAllowance.SIGNATURE ] = {
					err  : null,
					args : [
						users[ TOKEN_OWNER ].address,
						wl_user_pass,
						wl_user_flag,
						test_data.PASS_MAX,
					]
				}
				defaultArgs [ CONTRACT.METHODS.consumeWhitelist.SIGNATURE ] = {
					err  : null,
					args : [
						users[ TOKEN_OWNER ].address,
						wl_user_pass,
						wl_user_flag,
						test_data.PASS_MAX,
						1,
					]
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

function shouldBehaveLikeMock_IWhitelistableBeforeSettingWhitelist ( fixture, test_data ) {
	describe( 'Should behave like IWhitelistable before setting the whitelist', function () {
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

			describe( CONTRACT.METHODS.checkWhitelistAllowance.SIGNATURE, function () {
				if ( TEST.METHODS.checkWhitelistAllowance ) {
					it( 'Checking whitelist while whitelist is not set should be reverted with ' + ERROR.IWhitelistable_NOT_SET, async function () {
						const root    = test_data.PASS_ROOT
						const passMax = test_data.PASS_MAX
						const account = users[ TOKEN_OWNER ].address
						const proof   = generateProof( account, root, passMax )
						const pass    = proof.pass
						const flag    = proof.flag
						await shouldRevertWhenWitelistIsNotSet(
							contract.checkWhitelistAllowance( account, pass, flag, passMax )
						)
					})
				}
			})

			describe( CONTRACT.METHODS.consumeWhitelist.SIGNATURE, function () {
				if ( TEST.METHODS.consumeWhitelist ) {
					it( 'Trying to consume whitelist while whitelist is not set should be reverted with ' + ERROR.IWhitelistable_NOT_SET, async function () {
						const root    = test_data.PASS_ROOT
						const passMax = test_data.PASS_MAX
						const account = users[ TOKEN_OWNER ].address
						const proof   = generateProof( account, root, passMax )
						const pass    = proof.pass
						const flag    = proof.flag
						const qty     = 1
						await shouldRevertWhenWitelistIsNotSet(
							contract.connect( users[ TOKEN_OWNER ] )
											.consumeWhitelist( account, pass, flag, passMax, qty )
						)
					})
				}
			})

			describe( CONTRACT.METHODS.setWhitelist.SIGNATURE, function () {
				if ( TEST.METHODS.setWhitelist ) {
					it( 'Should be fulfilled', async function () {
						const root = test_data.PASS_ROOT.toHexString()
						await expect(
							contract.connect( users[ CONTRACT_DEPLOYER ] )
											.setWhitelist( root )
						).to.be.fulfilled
					})
				}
			})
		}
	})
}

function shouldBehaveLikeMock_IWhitelistableAfterSettingWhitelist ( fixture, test_data ) {
	describe( 'Should behave like IWhitelistable after setting the whitelist', function () {
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

			describe( CONTRACT.METHODS.checkWhitelistAllowance.SIGNATURE, function () {
				if ( TEST.METHODS.checkWhitelistAllowance ) {
					it( 'Checking whitelist with correct password should return ' + test_data.PASS_MAX, async function () {
						const root    = test_data.PASS_ROOT
						const passMax = test_data.PASS_MAX
						const account = users[ TOKEN_OWNER ].address
						const proof   = generateProof( account, root, passMax )
						const pass    = proof.pass
						const flag    = proof.flag
						expect(
							await contract.checkWhitelistAllowance( account, pass, flag, passMax )
						).to.equal( passMax )
					})

					it( 'Checking whitelist with incorrect password should be reverted with ' + ERROR.IWhitelistable_FORBIDDEN, async function () {
						const root          = test_data.PASS_ROOT
						const passMax       = test_data.PASS_MAX
						const proof         = generateProof( users[ TOKEN_OWNER ].address, root, passMax )
						const invalid_proof = generateProof( users[ OTHER_OWNER ].address, root, passMax )
						const account       = users[ TOKEN_OWNER ].address
						const pass          = invalid_proof.pass
						const flag          = proof.flag
						await shouldRevertWhenNotWhitelisted(
							contract.checkWhitelistAllowance( account, pass, flag, passMax )
						)
					})
				}
			})

			describe( CONTRACT.METHODS.consumeWhitelist.SIGNATURE, function () {
				if ( TEST.METHODS.consumeWhitelist ) {
					describe( 'Consuming 1 whitelist spot', function () {
						beforeEach( async function () {
							const root    = test_data.PASS_ROOT
							const passMax = test_data.PASS_MAX
							const account = users[ TOKEN_OWNER ].address
							const proof   = generateProof( account, root, passMax )
							const pass    = proof.pass
							const flag    = proof.flag
							const qty     = 1
							await contract.connect( users[ TOKEN_OWNER ] )
														.consumeWhitelist( account, pass, flag, passMax, qty )
						})

						it( 'Whitelist check should return ' + ( test_data.PASS_MAX - 1 ).toString(), async function () {
							const root    = test_data.PASS_ROOT
							const passMax = test_data.PASS_MAX
							const account = users[ TOKEN_OWNER ].address
							const proof   = generateProof( account, root, passMax )
							const pass    = proof.pass
							const flag    = proof.flag
							expect(
								await contract.checkWhitelistAllowance( account, pass, flag, passMax )
							).to.equal( test_data.PASS_MAX - 1 )
						})

						it( 'Trying to consume an additional ' + test_data.PASS_MAX + ' whitelist spots should be reverted with ' + ERROR.IWhitelistable_FORBIDDEN, async function () {
							const root    = test_data.PASS_ROOT
							const passMax = test_data.PASS_MAX
							const account = users[ TOKEN_OWNER ].address
							const proof   = generateProof( account, root, passMax )
							const pass    = proof.pass
							const flag    = proof.flag
							const qty     = passMax
							await shouldRevertWhenNotWhitelisted(
								contract.connect( users[ TOKEN_OWNER ] )
												.consumeWhitelist( account, pass, flag, passMax, qty )
							)
						})
					})

					describe( 'Consuming all the whitelist spots', function () {
						beforeEach( async function () {
							const root    = test_data.PASS_ROOT
							const passMax = test_data.PASS_MAX
							const account = users[ TOKEN_OWNER ].address
							const proof   = generateProof( account, root, passMax )
							const pass    = proof.pass
							const flag    = proof.flag
							const qty     = passMax
							await contract.connect( users[ TOKEN_OWNER ] )
														.consumeWhitelist( account, pass, flag, passMax, qty )
						})

						it( 'Whitelist check should be reverted with ' + ERROR.IWhitelistable_CONSUMED, async function () {
							const root    = test_data.PASS_ROOT
							const passMax = test_data.PASS_MAX
							const account = users[ TOKEN_OWNER ].address
							const proof   = generateProof( account, root, passMax )
							const pass    = proof.pass
							const flag    = proof.flag
							await shouldRevertWhenWhitelistIsConsumed(
								contract.checkWhitelistAllowance( account, pass, flag, passMax )
							)
						})
					})
				}
			})
		}
	})
}

describe( TEST.NAME, function () {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		testInvalidInputs( noWhitelistFixture, TEST_DATA )
		shouldBehaveLikeMock_IWhitelistableBeforeSettingWhitelist( noWhitelistFixture, TEST_DATA )
		shouldBehaveLikeMock_IWhitelistableAfterSettingWhitelist( whitelistFixture, TEST_DATA )
	}
})
