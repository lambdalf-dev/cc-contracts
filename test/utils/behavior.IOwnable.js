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
			OwnershipTransferred : true,
		},
		METHODS : {
			owner             : true,
			transferOwnership : true,
		},
	}

	// For contract data
	const CONTRACT = {
		EVENTS : {
			OwnershipTransferred : 'OwnershipTransferred',
		},
		METHODS : {
			owner : {
				SIGNATURE : 'owner()',
				PARAMS    : [],
			},
			transferOwnership : {
				SIGNATURE : 'transferOwnership(address)',
				PARAMS    : [ 'newOwner_' ],
			},
		},
	}

	let contract
	let users = {}
// **************************************

// **************************************
// *****        TEST  SUITES        *****
// **************************************
	async function shouldRevertWhenCallerIsNotContractOwner ( promise ) {
		await expect( promise ).to.be.revertedWith( ERROR.IOwnable_NOT_OWNER )
	}

	function shouldBehaveLikeIOwnable ( fixture, test_data ) {
		describe( 'Should behave like IOwnable', function () {
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

				describe( CONTRACT.METHODS.owner.SIGNATURE, function () {
					if ( TEST.METHODS.owner ) {
						it( 'Contract owner should be ' + USER_NAMES[ CONTRACT_DEPLOYER ], async function () {
							expect(
								await contract.owner()
							).to.equal( users[ CONTRACT_DEPLOYER ].address )
						})
					}
				})

				describe( CONTRACT.METHODS.transferOwnership.SIGNATURE, function () {
					if ( TEST.METHODS.transferOwnership ) {
						it( 'Regular user trying to transfer contract ownership should be reverted with ' + ERROR.IOwnable_NOT_OWNER, async function () {
							const newOwner = users[ USER1 ].address
							await shouldRevertWhenCallerIsNotContractOwner(
								contract.connect( users[ USER1 ] )
												.transferOwnership( newOwner )
							)
						})

						describe( 'Contract owner transfering ownership', function () {
							it( 'Contract owner should now be User1', async function () {
								const newOwner = users[ USER1 ].address
								await expect(
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.transferOwnership( newOwner )
								).to.emit( contract, CONTRACT.EVENTS.OwnershipTransferred )
										.withArgs( users[ CONTRACT_DEPLOYER ].address, newOwner )

								expect(
									await contract.owner()
								).to.equal( newOwner )
							})

							it( 'Contract owner should now be the NULL address', async function () {
								const newOwner = CST.ADDRESS_ZERO
								await expect(
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.transferOwnership( newOwner )
								).to.emit( contract, CONTRACT.EVENTS.OwnershipTransferred )
										.withArgs( users[ CONTRACT_DEPLOYER ].address, newOwner )

								expect(
									await contract.owner()
								).to.equal( CST.ADDRESS_ZERO )
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
	shouldBehaveLikeIOwnable,
	shouldRevertWhenCallerIsNotContractOwner,
}
