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
		shouldRevertWhenRequestedTokenDoesNotExist,
	} = require( './behavior.ERC721Base' )
// **************************************

// **************************************
// *****       TEST VARIABLES       *****
// **************************************
	// For activating or de-activating test cases
	const TEST = {
		METHODS : {
			name       : true,
			symbol     : true,
			tokenURI   : true,
		},
	}

	// For contract data
	const CONTRACT = {
		METHODS : {
			name        : {
				SIGNATURE : 'name()',
				PARAMS    : [],
			},
			symbol      : {
				SIGNATURE : 'symbol()',
				PARAMS    : [],
			},
			tokenURI    : {
				SIGNATURE : 'tokenURI(uint256)',
				PARAMS    : [ 'index_' ],
			},
		},
	}

	let contract
	let users = {}
// **************************************

// **************************************
// *****        TEST  SUITES        *****
// **************************************
	function shouldBehaveLikeERC721BaseMetadata ( fixture, test_data ) {
		describe( 'Should behave like ERC721BaseMetadata', function () {
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

				describe( CONTRACT.METHODS.name.SIGNATURE, function () {
					if ( TEST.METHODS.name ) {
						it( 'Name should be "' + test_data.PARAMS.name_ + '"', async function () {
							expect(
								await contract.name()
							).to.equal( test_data.PARAMS.name_ )
						})
					}
				})

				describe( CONTRACT.METHODS.symbol.SIGNATURE, function () {
					if ( TEST.METHODS.symbol ) {
						it( 'Symbol should be "' + test_data.PARAMS.symbol_ + '"', async function () {
							expect(
								await contract.symbol()
							).to.equal( test_data.PARAMS.symbol_ )
						})
					}
				})

				describe( CONTRACT.METHODS.tokenURI.SIGNATURE, function () {
					if ( TEST.METHODS.tokenURI ) {
						it( 'Unminted token URI should be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async function () {
							await shouldRevertWhenRequestedTokenDoesNotExist(
								contract.tokenURI( test_data.UNMINTED_TOKEN )
							)
						})

						it( 'First token URI should be "' + test_data.FIRST_TOKEN + '"', async function () {
							const tokenId = test_data.FIRST_TOKEN
							expect(
								await contract.tokenURI( tokenId )
							).to.equal( test_data.INIT_BASE_URI + tokenId.toString() )
						})

						it( 'Second token URI should be "' + test_data.SECOND_TOKEN + '"', async function () {
							const tokenId = test_data.SECOND_TOKEN
							expect(
								await contract.tokenURI( tokenId )
							).to.equal( test_data.INIT_BASE_URI + tokenId.toString() )
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
	shouldBehaveLikeERC721BaseMetadata,
}
