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
			totalSupply         : true,
			tokenOfOwnerByIndex : true,
			tokenByIndex        : true,
		},
	}

	// For contract data
	const CONTRACT = {
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

	let contract
	let users = {}
// **************************************

// **************************************
// *****        TEST  SUITES        *****
// **************************************
	const shouldBehaveLikeERC721BaseEnumerableBeforeMint = function( fixture, test_data ) {
		describe( 'Should behave like ERC721BaseEnumerable before any token is minted', function() {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				before( async function () {
					holder_artifact = await ethers.getContractFactory( 'Mock_ERC721Receiver' )
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
				})

				describe( CONTRACT.METHODS.totalSupply.SIGNATURE, function() {
					if ( TEST.METHODS.totalSupply ) {
						it( 'Total supply should be ' + test_data.INIT_SUPPLY, async function() {
							expect(
								await contract.totalSupply()
							).to.equal( test_data.INIT_SUPPLY )
						})
					}
				})
			}
		})
	}

	const shouldBehaveLikeERC721BaseEnumerableAfterMint = function( fixture, test_data ) {
		describe( 'Should behave like ERC721BaseEnumerable after minting ' + test_data.MINTED_SUPPLY + ' tokens', function() {
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

				describe( CONTRACT.METHODS.tokenByIndex.SIGNATURE, function() {
					if ( TEST.METHODS.tokenByIndex ) {
						it( 'Trying to get unminted token index should be reverted with ' + ERROR.IERC721Enumerable_INDEX_OUT_OF_BOUNDS, async function() {
							const index = test_data.OUT_OF_BOUNDS_INDEX
							await expect(
								contract.tokenByIndex( index )
							).to.be.revertedWith( ERROR.IERC721Enumerable_INDEX_OUT_OF_BOUNDS )
						})

						it( 'Token at index ' + test_data.TARGET_INDEX + ' should be token ' + test_data.TARGET_INDEX, async function() {
							const index = test_data.TARGET_INDEX
							expect(
								await contract.tokenByIndex( index )
							).to.equal( test_data.TARGET_INDEX )
						})
					}
				})

				describe( CONTRACT.METHODS.tokenOfOwnerByIndex.SIGNATURE, function() {
					if ( TEST.METHODS.tokenOfOwnerByIndex ) {
						it( 'Token of non token holder at index ' + test_data.TARGET_INDEX + ' should be reverted with ' + ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS, async function() {
							const tokenOwner = users[ USER1 ].address
							const index = test_data.TARGET_INDEX
							await expect(
								contract.tokenOfOwnerByIndex( tokenOwner, index )
							).to.be.revertedWith( ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS )
						})

						it( 'Trying to get unminted token index should be reverted with ' + ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS, async function() {
							const tokenOwner = users[ TOKEN_OWNER ].address
							const index = test_data.OUT_OF_BOUNDS_INDEX
							await expect(
								contract.tokenOfOwnerByIndex( tokenOwner, index )
							).to.be.revertedWith( ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS )
						})

						it( 'Trying to get token of the null address should be reverted with ' + ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS, async function() {
							const tokenOwner = CST.ADDRESS_ZERO
							const index = test_data.TARGET_INDEX
							await expect(
								contract.tokenOfOwnerByIndex( tokenOwner, index )
							).to.be.revertedWith( ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS )
						})

						it( 'Token of ' + USER_NAMES[ TOKEN_OWNER ] + ' at index ' + test_data.TARGET_INDEX + ' should be token ' + ( test_data.TOKEN_OWNER_FIRST + test_data.TARGET_INDEX ).toString(), async function() {
							const tokenOwner = users[ TOKEN_OWNER ].address
							const index = test_data.TARGET_INDEX
							expect(
								await contract.tokenOfOwnerByIndex( tokenOwner, index )
							).to.equal( test_data.TOKEN_OWNER_FIRST + test_data.TARGET_INDEX )
						})

						it( 'Token of ' + USER_NAMES[ TOKEN_OWNER ] + ' at index ' + test_data.INDEX_SECOND + ' should be token ' + ( test_data.TOKEN_OWNER_MID ).toString(), async function() {
							const tokenOwner = users[ TOKEN_OWNER ].address
							const index = test_data.INDEX_SECOND
							expect(
								await contract.tokenOfOwnerByIndex( tokenOwner, index )
							).to.equal( test_data.TOKEN_OWNER_MID )
						})

						it( 'Token of ' + USER_NAMES[ OTHER_OWNER ] + ' at index ' + test_data.INDEX_ZERO + ' should be token ' + ( test_data.OTHER_OWNER_FIRST + test_data.INDEX_ZERO ).toString(), async function() {
							const tokenOwner = users[ OTHER_OWNER ].address
							const index = test_data.INDEX_ZERO
							expect(
								await contract.tokenOfOwnerByIndex( tokenOwner, index )
							).to.equal( test_data.OTHER_OWNER_FIRST + test_data.INDEX_ZERO )
						})
					}
				})

				describe( CONTRACT.METHODS.totalSupply.SIGNATURE, function() {
					if ( TEST.METHODS.totalSupply ) {
						it( 'Total supply should be ' + test_data.MINTED_SUPPLY, async function() {
							expect(
								await contract.totalSupply()
							).to.equal( test_data.MINTED_SUPPLY )
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
	shouldBehaveLikeERC721BaseEnumerableBeforeMint,
	shouldBehaveLikeERC721BaseEnumerableAfterMint,
}
