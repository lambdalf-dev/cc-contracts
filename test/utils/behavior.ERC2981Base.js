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
		METHODS : {
			royaltyInfo       : true,
			setRoyaltyInfo    : true,
		},
	}

	// For contract data
	const CONTRACT = {
		METHODS : {
			royaltyInfo : {
				SIGNATURE : 'royaltyInfo(uint256,uint256)',
				PARAMS    : [ 'tokenId_', 'salePrice_' ],
			},
			setRoyaltyInfo : {
				SIGNATURE : 'setRoyaltyInfo(address,uint256)',
				PARAMS    : [ 'royaltyRecipient_', 'royaltyRate_' ],
			},
		},
	}

	let contract
	let users = {}
// **************************************

// **************************************
// *****        TEST  SUITES        *****
// **************************************
	function shouldBehaveLikeERC2981Base ( fixture, test_data ) {
		describe( 'Should behave like ERC2981Base', function () {
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

				describe( CONTRACT.METHODS.royaltyInfo.SIGNATURE, function () {
					if ( TEST.METHODS.royaltyInfo ) {
						it( 'Royalty info for sale price 1 ETH should be ' + USER_NAMES[ CONTRACT_DEPLOYER ] + ' and royalties amount ' + CST.ONE_ETH.mul( test_data.PARAMS.royaltyRate_ ).div( CST.ROYALTY_BASE ), async function () {
							const tokenId      = test_data.TARGET_TOKEN
							const salePrice    = CST.ONE_ETH
							const expectedRate = salePrice.mul( test_data.PARAMS.royaltyRate_ ).div( CST.ROYALTY_BASE )

							const royaltyInfo = await contract.royaltyInfo( tokenId, salePrice )
							expect( royaltyInfo ).to.exist
							expect( royaltyInfo[ 0 ] ).to.equal( users[ CONTRACT_DEPLOYER ].address )
							expect( royaltyInfo[ 1 ] ).to.equal( expectedRate )
						})

						it( 'Royalty info for sale price 0 should be ' + USER_NAMES[ CONTRACT_DEPLOYER ] + ' and royalties amount 0', async function () {
							const tokenId      = test_data.TARGET_TOKEN
							const salePrice    = 0
							const expectedRate = 0

							const royaltyInfo = await contract.royaltyInfo( tokenId, salePrice )
							expect( royaltyInfo ).to.exist
							expect( royaltyInfo[ 0 ] ).to.equal( users[ CONTRACT_DEPLOYER ].address )
							expect( royaltyInfo[ 1 ] ).to.equal( expectedRate )
						})
					}
				})

				describe( CONTRACT.METHODS.setRoyaltyInfo.SIGNATURE, function () {
					if ( TEST.METHODS.setRoyaltyInfo ) {
						describe( 'Setting royalty rate to ' + ( test_data.PARAMS.royaltyRate_ * 2 ).toString(), function () {
							it( 'Royalty info for price 1 ETH should be ' + USER_NAMES[ USER1 ] + ' and ' + CST.ONE_ETH.mul( test_data.PARAMS.royaltyRate_ * 2 ).div( CST.ROYALTY_BASE ), async function () {
								const royaltyRecipient = users[ USER1 ].address
								const royaltyRate      = test_data.PARAMS.royaltyRate_ + 1
								await contract.connect( users[ CONTRACT_DEPLOYER ] )
															.setRoyaltyInfo( royaltyRecipient, royaltyRate )

								const tokenId      = test_data.TARGET_TOKEN
								const salePrice    = CST.ONE_ETH
								const expectedRate = salePrice.mul( royaltyRate ).div( CST.ROYALTY_BASE )

								const royaltyInfo = await contract.royaltyInfo( tokenId, salePrice )
								expect( royaltyInfo ).to.exist
								expect( royaltyInfo[ 0 ] ).to.equal( users[ USER1 ].address )
								expect( royaltyInfo[ 1 ] ).to.equal( expectedRate )
							})
						})

						describe( 'Setting royalty rate to more than 100%', function () {
							it( 'Should be reverted with ' + ERROR.IERC2981_INVALID_ROYALTIES, async function () {
								const royaltyRecipient = users[ USER1 ].address
								const royaltyRate      = CST.ROYALTY_BASE + 1
								await expect(
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.setRoyaltyInfo( royaltyRecipient, royaltyRate )
								).to.be.revertedWith( ERROR.IERC2981_INVALID_ROYALTIES )

								const tokenId      = test_data.TARGET_TOKEN
								const salePrice    = CST.ONE_ETH
								const expectedRate = salePrice.mul( test_data.PARAMS.royaltyRate_ ).div( CST.ROYALTY_BASE )

								const royaltyInfo = await contract.royaltyInfo( tokenId, salePrice )
								expect( royaltyInfo ).to.exist
								expect( royaltyInfo[ 0 ] ).to.equal( users[ CONTRACT_DEPLOYER ].address )
								expect( royaltyInfo[ 1 ] ).to.equal( expectedRate )
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
	shouldBehaveLikeERC2981Base,
}
