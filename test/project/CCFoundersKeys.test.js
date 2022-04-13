const PROXY = require( '../../artifacts/contracts/mocks/external/Mock_ProxyRegistry.sol/Mock_ProxyRegistry.json' )
const ARTIFACT = require( '../../artifacts/contracts/project/CCFoundersKeys.sol/CCFoundersKeys.json' )
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

	const { getTestCasesByFunction, generateTestCase } = require( '../fail-test-module' )

	const {
		shouldSupportInterface,
	} = require( '../utils/behavior.ERC165' )

	const {
		shouldBehaveLikeERC2981Base,
	} = require( '../utils/behavior.ERC2981Base' )

	const {
		shouldBehaveLikeIOwnable,
		shouldRevertWhenCallerIsNotContractOwner,
	} = require( '../utils/behavior.IOwnable' )

	const {
		shouldBehaveLikeIPausable,
		shouldRevertWhenSaleStateIsNotClose,
		shouldRevertWhenSaleStateIsNotPreSale,
		shouldRevertWhenSaleStateIsNotSale,
	} = require( '../utils/behavior.IPausable' )

	const {
		generateProof,
		shouldRevertWhenWitelistIsNotSet,
		shouldRevertWhenWhitelistIsConsumed,
		shouldRevertWhenNotWhitelisted,
	} = require( '../utils/behavior.IWhitelistable' )

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
	} = require( '../ERC721/behavior.ERC721BaseEnumerable' )

	const {
		shouldBehaveLikeERC721BatchStakable,
	} = require( '../ERC721/behavior.ERC721BatchStakable' )
// **************************************

// **************************************
// *****       TEST VARIABLES       *****
// **************************************
	// For activating or de-activating test cases
	const TEST = {
		NAME : 'CCFoundersKeys',
		EVENTS : {
			Approval            : true,
			ApprovalForAll      : true,
			ConsecutiveTransfer : true,
			PaymentReleased     : true,
			SaleStateChanged    : true,
			Transfer            : true,
		},
		METHODS : {
			// **************************************
			// *****           PUBLIC           *****
			// **************************************
				claim                : true,
				claimAndStake        : true,
				mintPreSale          : true,
				mintPreSaleAndStake  : true,
				mint                 : true,
				mintAndStake         : true,
				approve              : true,
				safeTransferFrom     : true,
				safeTransferFrom_ol  : true,
				setApprovalForAll    : true,
				stake                : true,
				transferFrom         : true,
				unstake              : true,
			// **************************************

			// **************************************
			// *****       CONTRACT_OWNER       *****
			// **************************************
				airdrop              : true,
				setAnonClaimList     : true,
				setWhitelist         : true,
				setProxyRegistry     : true,
				setRoyaltyInfo       : true,
				setSaleState         : true,
				transferOwnership    : true,
				withdraw             : true,
			// **************************************

			// **************************************
			// *****            VIEW            *****
			// **************************************
				balanceOf            : true,
				balanceOfStaked      : true,
				getApproved          : true,
				isApprovedForAll     : true,
				name                 : true,
				owner                : true,
				ownerOf              : true,
				ownerOfStaked        : true,
				royaltyInfo          : true,
				saleState            : true,
				supportsInterface    : true,
				symbol               : true,
				tokenByIndex         : true,
				tokenOfOwnerByIndex  : true,
				tokenURI             : true,
				totalSupply          : true,
			// **************************************

			// **************************************
			// *****            PURE            *****
			// **************************************
				onERC721Received     : true,
			// **************************************
		},
	}

	// For contract data
	const CONTRACT = {
		NAME : 'CCFoundersKeys',
		EVENTS : {
			Approval            : 'Approval',
			ApprovalForAll      : 'ApprovalForAll',
			ConsecutiveTransfer : 'ConsecutiveTransfer',
			PaymentReleased     : 'PaymentReleased',
			SaleStateChanged    : 'SaleStateChanged',
			Transfer            : 'Transfer',
		},
		METHODS : {
			// **************************************
			// *****           PUBLIC           *****
			// **************************************
				approve              : {
					SIGNATURE          : 'approve(address,uint256)',
					PARAMS             : [ 'to_', 'tokenId_' ],
				},
				claim                : {
					SIGNATURE          : 'claim(uint256)',
					PARAMS             : [ 'qty_' ],
				},
				claimAndStake        : {
					SIGNATURE          : 'claimAndStake(uint256,uint256)',
					PARAMS             : [ 'qty_', 'qtyStaked_' ],
				},
				mintPreSale          : {
					SIGNATURE          : 'mintPreSale(uint256,bytes32,bool,uint256)',
					PARAMS             : [ 'qty_', 'pass_', 'flag_', 'passMax_' ],
				},
				mintPreSaleAndStake  : {
					SIGNATURE          : 'mintPreSaleAndStake(uint256,bytes32,bool,uint256,uint256)',
					PARAMS             : [ 'qty_', 'pass_', 'flag_', 'passMax_', 'qtyStaked_' ],
				},
				mint                 : {
					SIGNATURE          : 'mint(uint256)',
					PARAMS             : [ 'qty_' ],
				},
				mintAndStake         : {
					SIGNATURE          : 'mintAndStake(uint256,uint256)',
					PARAMS             : [ 'qty_', 'qtyStaked_' ],
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
				stake                : {
					SIGNATURE          : 'stake(uint256)',
					PARAMS             : [ 'tokenId_' ],
				},
				transferFrom         : {
					SIGNATURE          : 'transferFrom(address,address,uint256)',
					PARAMS             : [ 'from_', 'to_', 'tokenId_' ],
				},
				unstake              : {
					SIGNATURE          : 'unstake(uint256)',
					PARAMS             : [ 'tokenId_' ],
				},
			// **************************************

			// **************************************
			// *****       CONTRACT_OWNER       *****
			// **************************************
				airdrop              : {
					SIGNATURE          : 'airdrop(address[],uint256[])',
					PARAMS             : [ 'accounts_', 'amounts_' ],
				},
				setAnonClaimList     : {
					SIGNATURE          : 'setAnonClaimList(address[],uint256[])',
					PARAMS             : [ 'accounts_', 'amounts_' ],
				},
				setProxyRegistry     : {
					SIGNATURE          : 'setProxyRegistry(address)',
					PARAMS             : [ 'proxyRegistryAddress_' ],
				},
				setRoyaltyInfo       : {
					SIGNATURE          : 'setRoyaltyInfo(address,uint256)',
					PARAMS             : [ 'royaltyRecipient_', 'royaltyRate_' ],
				},
				setSaleState         : {
					SIGNATURE          : 'setSaleState(uint8)',
					PARAMS             : [ 'newState_' ],
				},
				setWhitelist         : {
					SIGNATURE          : 'setWhitelist(bytes32)',
					PARAMS             : [ 'root_' ],
				},
				transferOwnership    : {
					SIGNATURE          : 'transferOwnership(address)',
					PARAMS             : [ 'newOwner_' ],
				},
				withdraw             : {
					SIGNATURE          : 'withdraw()',
					PARAMS             : [],
				},
			// **************************************

			// **************************************
			// *****            VIEW            *****
			// **************************************
				balanceOf            : {
					SIGNATURE          : 'balanceOf(address)',
					PARAMS             : [ 'tokenOwner_' ],
				},
				balanceOfStaked      : {
					SIGNATURE          : 'balanceOfStaked(address)',
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
				owner                : {
					SIGNATURE          : 'owner()',
					PARAMS             : [],
				},
				ownerOf              : {
					SIGNATURE          : 'ownerOf(uint256)',
					PARAMS             : [ 'tokenId_' ],
				},
				ownerOfStaked        : {
					SIGNATURE          : 'ownerOfStaked(uint256)',
					PARAMS             : [ 'tokenId_' ],
				},
				royaltyInfo          : {
					SIGNATURE          : 'royaltyInfo(uint256,uint256)',
					PARAMS             : [ 'tokenId_', 'salePrice_' ],
				},
				saleState            : {
					SIGNATURE          : 'saleState()',
					PARAMS             : [],
				},
				supportsInterface    : {
					SIGNATURE          : 'supportsInterface(bytes4)',
					PARAMS             : [ 'interfaceId_' ],
				},
				symbol               : {
					SIGNATURE          : 'symbol()',
					PARAMS             : [],
				},
				tokenByIndex         : {
					SIGNATURE          : 'tokenByIndex(uint256)',
					PARAMS             : [ 'index_' ],
				},
				tokenOfOwnerByIndex  : {
					SIGNATURE          : 'tokenOfOwnerByIndex(address,uint256)',
					PARAMS             : [ 'tokenOwner_', 'index_' ],
				},
				tokenURI             : {
					SIGNATURE          : 'tokenURI(uint256)',
					PARAMS             : [ 'index_' ],
				},
				totalSupply          : {
					SIGNATURE          : 'totalSupply()',
					PARAMS             : [],
				},
			// **************************************

			// **************************************
			// *****            PURE            *****
			// **************************************
				onERC721Received     : {
					SIGNATURE          : 'onERC721Received(address,address,uint256,bytes)',
					PARAMS             : [ 'operator_', 'from_', 'tokenId_', 'data_' ],
				},
			// **************************************
		},
		ERRORS : {
			CCFoundersKeys_ARRAY_LENGTH_MISMATCH    : 'CCFoundersKeys_ARRAY_LENGTH_MISMATCH',
			CCFoundersKeys_FORBIDDEN                : 'CCFoundersKeys_FORBIDDEN',
			CCFoundersKeys_INCORRECT_PRICE          : 'CCFoundersKeys_INCORRECT_PRICE',
			CCFoundersKeys_INSUFFICIENT_KEY_BALANCE : 'CCFoundersKeys_INSUFFICIENT_KEY_BALANCE',
			CCFoundersKeys_MAX_BATCH                : 'CCFoundersKeys_MAX_BATCH',
			CCFoundersKeys_MAX_RESERVE              : 'CCFoundersKeys_MAX_RESERVE',
			CCFoundersKeys_MAX_SUPPLY               : 'CCFoundersKeys_MAX_SUPPLY',
			CCFoundersKeys_NO_ETHER_BALANCE         : 'CCFoundersKeys_NO_ETHER_BALANCE',
			CCFoundersKeys_TRANSFER_FAIL            : 'CCFoundersKeys_TRANSFER_FAIL',
		},
	}

	// AIRDROP
	const AIRDROP1                = 1
	const AIRDROP2                = 2
	// WHITELIST
	const PASS_MAX                = CST.PASS_MAX
	const PASS_ROOT               = CST.PASS_ROOT
	// SUPPLY
	const INIT_SUPPLY             = 0
	const INIT_STAKED             = 0
	// TARGET TOKEN
	const FIRST_TOKEN             = 0
	const SECOND_TOKEN            = 1
	const TARGET_TOKEN            = 3
	const STAKED_TOKEN            = FIRST_TOKEN
	// TOKEN OWNER
	const TOKEN_OWNER_INIT_SUPPLY = 6
	const TOKEN_OWNER_MORE_SUPPLY = 3
	const TOKEN_OWNER_SUPPLY      = TOKEN_OWNER_INIT_SUPPLY + TOKEN_OWNER_MORE_SUPPLY
	const TOKEN_OWNER_STAKED      = 2
	const TOKEN_OWNER_FIRST       = FIRST_TOKEN
	const TOKEN_OWNER_LAST        = TOKEN_OWNER_FIRST + TOKEN_OWNER_INIT_SUPPLY - 1
	const TOKEN_OWNER_CL          = 2
	const TOKEN_OWNER_WL          = 5
	// OTHER OWNER
	const OTHER_OWNER_STAKED      = 1
	const OTHER_OWNER_SUPPLY      = 1
	const OTHER_OWNER_FIRST       = TOKEN_OWNER_LAST + 1
	const OTHER_OWNER_LAST        = OTHER_OWNER_FIRST + OTHER_OWNER_SUPPLY - 1
	const OTHER_OWNER_CL          = 1
	const OTHER_OWNER_WL          = 1
	// NON EXISTENT
	const LAST_TOKEN              = FIRST_TOKEN + TOKEN_OWNER_SUPPLY + OTHER_OWNER_SUPPLY -1
	const UNMINTED_TOKEN          = TOKEN_OWNER_SUPPLY + OTHER_OWNER_SUPPLY + 10
	// METADATA
	const INIT_BASE_URI           = 'https://api.example.com/'
	const NEW_BASE_URI            = 'https://exemple.com/api/'

	// For test data
	const TEST_DATA = {
		// AIRDROP
		AIRDROP1                    : AIRDROP1,
		AIRDROP2                    : AIRDROP2,
		// WHITELIST
		PASS_MAX                    : PASS_MAX,
		PASS_ROOT                   : PASS_ROOT,
		// SUPPLY
		INIT_SUPPLY                 : INIT_SUPPLY,
		MINTED_SUPPLY               : INIT_SUPPLY + TOKEN_OWNER_SUPPLY + OTHER_OWNER_SUPPLY,
		STAKED_SUPPLY               : INIT_STAKED + TOKEN_OWNER_STAKED + OTHER_OWNER_STAKED,
		// TARGET TOKEN
		FIRST_TOKEN                 : INIT_SUPPLY + FIRST_TOKEN,
		SECOND_TOKEN                : INIT_SUPPLY + SECOND_TOKEN,
		STAKED_TOKEN                : INIT_SUPPLY + STAKED_TOKEN,
		TARGET_TOKEN                : INIT_SUPPLY + TARGET_TOKEN,
		UNMINTED_TOKEN              : INIT_SUPPLY + UNMINTED_TOKEN,
		// TOKEN OWNER
		TOKEN_OWNER_INIT_SUPPLY     : TOKEN_OWNER_INIT_SUPPLY,
		TOKEN_OWNER_MORE_SUPPLY     : TOKEN_OWNER_MORE_SUPPLY,
		TOKEN_OWNER_STAKED          : TOKEN_OWNER_STAKED,
		TOKEN_OWNER_SUPPLY          : TOKEN_OWNER_SUPPLY,
		TOKEN_OWNER_FIRST           : INIT_SUPPLY + FIRST_TOKEN,
		TOKEN_OWNER_LAST            : INIT_SUPPLY + LAST_TOKEN,
		TOKEN_OWNER_MID             : TOKEN_OWNER_INIT_SUPPLY + OTHER_OWNER_SUPPLY + 1,
		TOKEN_OWNER_CL              : TOKEN_OWNER_CL,
		TOKEN_OWNER_WL              : TOKEN_OWNER_WL,
		// OTHER OWNER
		OTHER_OWNER_STAKED          : OTHER_OWNER_STAKED,
		OTHER_OWNER_SUPPLY          : OTHER_OWNER_SUPPLY,
		OTHER_OWNER_FIRST           : INIT_SUPPLY + OTHER_OWNER_FIRST,
		OTHER_OWNER_LAST            : INIT_SUPPLY + OTHER_OWNER_LAST,
		OTHER_OWNER_CL              : OTHER_OWNER_CL,
		OTHER_OWNER_WL              : OTHER_OWNER_WL,
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
			reserve_          : 345,
			maxBatch_         : 10,
			maxSupply_        : 5555,
			royaltyRate_      : 75,
			wlMintPrice_      : ethers.BigNumber.from( '69000000000000000' ),
			publicMintPrice_  : ethers.BigNumber.from( '100000000000000000' ),
			name_             : 'NFT Token',
			symbol_           : 'NFT',
			baseURI_          : INIT_BASE_URI,
		},
		// INTERFACES
		INTERFACES : [
			'IERC165',
			'IERC721',
			'IERC721Metadata',
			'IERC721Enumerable',
			'IERC2981',
		],
		// EXTREME CASE
		MINT_OUT : {
			TOKEN_OWNER_CL : TOKEN_OWNER_CL + 2,
			TOKEN_OWNER_WL : TOKEN_OWNER_WL + 2,
			OTHER_OWNER_CL : OTHER_OWNER_CL + 2,
			OTHER_OWNER_WL : OTHER_OWNER_WL + 2,
			MINT_QTY       : 100,
			PARAMS : {
				reserve_     : INIT_SUPPLY + AIRDROP1 + AIRDROP2,
				maxBatch_    : 100,
				maxSupply_   : INIT_SUPPLY + AIRDROP1 + AIRDROP2 + 100,
			},
		},
	}

	let test_qty
	let test_root
	let test_pass
	let test_flag
	let test_proof
	let test_amounts
	let test_passMax
	let test_accounts
	let test_newState
	let test_qtyStaked
	let test_tx_params = {}
	let test_contract_params
	let test_proxyRegistryAddress
	let test_proxy_contract_params

	let users = {}
	let contract
	let proxy_contract
// **************************************

// **************************************
// *****          FIXTURES          *****
// **************************************
	async function noMintFixture () {
		const [
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_proxy_contract_params = []
		test_proxy_contract = await deployContract( test_contract_deployer, PROXY, test_proxy_contract_params )
		await test_proxy_contract.deployed()
		await test_proxy_contract.setProxy( test_token_owner.address, test_proxy_user.address )

		test_contract_params = [
			TEST_DATA.PARAMS.reserve_,
			TEST_DATA.PARAMS.maxBatch_,
			TEST_DATA.PARAMS.maxSupply_,
			TEST_DATA.PARAMS.royaltyRate_,
			TEST_DATA.PARAMS.wlMintPrice_,
			TEST_DATA.PARAMS.publicMintPrice_,
			TEST_DATA.PARAMS.name_,
			TEST_DATA.PARAMS.symbol_,
			TEST_DATA.PARAMS.baseURI_,
			// test_dev.address,
			[
				test_safe.address,
				test_charity.address,
				test_founders.address,
				test_community.address,
			],
		]
		test_contract = await deployContract( test_contract_deployer, ARTIFACT, test_contract_params )
		await test_contract.deployed()

		return {
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_contract,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_proxy_contract,
			test_contract_deployer,
		}
	}

	async function proxyFixture () {
		const [
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_proxy_contract_params = []
		test_proxy_contract = await deployContract( test_contract_deployer, PROXY, test_proxy_contract_params )
		await test_proxy_contract.deployed()
		await test_proxy_contract.setProxy( test_token_owner.address, test_proxy_user.address )

		test_contract_params = [
			TEST_DATA.PARAMS.reserve_,
			TEST_DATA.PARAMS.maxBatch_,
			TEST_DATA.PARAMS.maxSupply_,
			TEST_DATA.PARAMS.royaltyRate_,
			TEST_DATA.PARAMS.wlMintPrice_,
			TEST_DATA.PARAMS.publicMintPrice_,
			TEST_DATA.PARAMS.name_,
			TEST_DATA.PARAMS.symbol_,
			TEST_DATA.PARAMS.baseURI_,
			// test_dev.address,
			[
				test_safe.address,
				test_charity.address,
				test_founders.address,
				test_community.address,
			],
		]
		test_contract = await deployContract( test_contract_deployer, ARTIFACT, test_contract_params )
		await test_contract.deployed()

		test_proxyRegistryAddress = test_proxy_contract.address
		await test_contract.connect( test_contract_deployer )
											 .setProxyRegistry( test_proxyRegistryAddress )

		return {
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_contract,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_proxy_contract,
			test_contract_deployer,
		}
	}

	async function presaleFixture () {
		const [
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_proxy_contract_params = []
		test_proxy_contract = await deployContract( test_contract_deployer, PROXY, test_proxy_contract_params )
		await test_proxy_contract.deployed()
		await test_proxy_contract.setProxy( test_token_owner.address, test_proxy_user.address )

		test_contract_params = [
			TEST_DATA.PARAMS.reserve_,
			TEST_DATA.PARAMS.maxBatch_,
			TEST_DATA.PARAMS.maxSupply_,
			TEST_DATA.PARAMS.royaltyRate_,
			TEST_DATA.PARAMS.wlMintPrice_,
			TEST_DATA.PARAMS.publicMintPrice_,
			TEST_DATA.PARAMS.name_,
			TEST_DATA.PARAMS.symbol_,
			TEST_DATA.PARAMS.baseURI_,
			// test_dev.address,
			[
				test_safe.address,
				test_charity.address,
				test_founders.address,
				test_community.address,
			],
		]
		test_contract = await deployContract( test_contract_deployer, ARTIFACT, test_contract_params )
		await test_contract.deployed()

		test_proxyRegistryAddress = test_proxy_contract.address
		await test_contract.connect( test_contract_deployer )
											 .setProxyRegistry( test_proxyRegistryAddress )

		test_newState = CST.SALE_STATE.PRESALE
		await test_contract.connect( test_contract_deployer )
											 .setSaleState( test_newState )

		return {
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_contract,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_proxy_contract,
			test_contract_deployer,
		}
	}

	async function anonClaimListFixture () {
		const [
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_proxy_contract_params = []
		test_proxy_contract = await deployContract( test_contract_deployer, PROXY, test_proxy_contract_params )
		await test_proxy_contract.deployed()
		await test_proxy_contract.setProxy( test_token_owner.address, test_proxy_user.address )

		test_contract_params = [
			TEST_DATA.PARAMS.reserve_,
			TEST_DATA.PARAMS.maxBatch_,
			TEST_DATA.PARAMS.maxSupply_,
			TEST_DATA.PARAMS.royaltyRate_,
			TEST_DATA.PARAMS.wlMintPrice_,
			TEST_DATA.PARAMS.publicMintPrice_,
			TEST_DATA.PARAMS.name_,
			TEST_DATA.PARAMS.symbol_,
			TEST_DATA.PARAMS.baseURI_,
			// test_dev.address,
			[
				test_safe.address,
				test_charity.address,
				test_founders.address,
				test_community.address,
			],
		]
		test_contract = await deployContract( test_contract_deployer, ARTIFACT, test_contract_params )
		await test_contract.deployed()

		test_proxyRegistryAddress = test_proxy_contract.address
		await test_contract.connect( test_contract_deployer )
											 .setProxyRegistry( test_proxyRegistryAddress )

		test_accounts = [
			test_token_owner.address,
			test_other_owner.address
		]
		test_amounts = [ 
			TEST_DATA.TOKEN_OWNER_CL,
			TEST_DATA.OTHER_OWNER_CL,
		]
		await test_contract.connect( test_contract_deployer )
											 .setAnonClaimList( test_accounts, test_amounts )

		test_newState = CST.SALE_STATE.PRESALE
		await test_contract.connect( test_contract_deployer )
											 .setSaleState( test_newState )

		return {
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_contract,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_proxy_contract,
			test_contract_deployer,
		}
	}

	async function whitelistFixture () {
		const [
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_proxy_contract_params = []
		test_proxy_contract = await deployContract( test_contract_deployer, PROXY, test_proxy_contract_params )
		await test_proxy_contract.deployed()
		await test_proxy_contract.setProxy( test_token_owner.address, test_proxy_user.address )

		test_contract_params = [
			TEST_DATA.PARAMS.reserve_,
			TEST_DATA.PARAMS.maxBatch_,
			TEST_DATA.PARAMS.maxSupply_,
			TEST_DATA.PARAMS.royaltyRate_,
			TEST_DATA.PARAMS.wlMintPrice_,
			TEST_DATA.PARAMS.publicMintPrice_,
			TEST_DATA.PARAMS.name_,
			TEST_DATA.PARAMS.symbol_,
			TEST_DATA.PARAMS.baseURI_,
			// test_dev.address,
			[
				test_safe.address,
				test_charity.address,
				test_founders.address,
				test_community.address,
			],
		]
		test_contract = await deployContract( test_contract_deployer, ARTIFACT, test_contract_params )
		await test_contract.deployed()

		test_proxyRegistryAddress = test_proxy_contract.address
		await test_contract.connect( test_contract_deployer )
											 .setProxyRegistry( test_proxyRegistryAddress )

		test_root = TEST_DATA.PASS_ROOT.toHexString()
		await test_contract.connect( test_contract_deployer )
											 .setWhitelist( test_root )

		test_newState = CST.SALE_STATE.PRESALE
		await test_contract.connect( test_contract_deployer )
											 .setSaleState( test_newState )

		return {
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_contract,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_proxy_contract,
			test_contract_deployer,
		}
	}

	async function saleFixture () {
		const [
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_proxy_contract_params = []
		test_proxy_contract = await deployContract( test_contract_deployer, PROXY, test_proxy_contract_params )
		await test_proxy_contract.deployed()
		await test_proxy_contract.setProxy( test_token_owner.address, test_proxy_user.address )

		test_contract_params = [
			TEST_DATA.PARAMS.reserve_,
			TEST_DATA.PARAMS.maxBatch_,
			TEST_DATA.PARAMS.maxSupply_,
			TEST_DATA.PARAMS.royaltyRate_,
			TEST_DATA.PARAMS.wlMintPrice_,
			TEST_DATA.PARAMS.publicMintPrice_,
			TEST_DATA.PARAMS.name_,
			TEST_DATA.PARAMS.symbol_,
			TEST_DATA.PARAMS.baseURI_,
			// test_dev.address,
			[
				test_safe.address,
				test_charity.address,
				test_founders.address,
				test_community.address,
			],
		]
		test_contract = await deployContract( test_contract_deployer, ARTIFACT, test_contract_params )
		await test_contract.deployed()

		test_proxyRegistryAddress = test_proxy_contract.address
		await test_contract.connect( test_contract_deployer )
											 .setProxyRegistry( test_proxyRegistryAddress )

		test_newState = CST.SALE_STATE.SALE
		await test_contract.connect( test_contract_deployer )
											 .setSaleState( test_newState )

		return {
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_contract,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_proxy_contract,
			test_contract_deployer,
		}
	}

	async function mintFixture () {
		const [
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_proxy_contract_params = []
		test_proxy_contract = await deployContract( test_contract_deployer, PROXY, test_proxy_contract_params )
		await test_proxy_contract.deployed()
		await test_proxy_contract.setProxy( test_token_owner.address, test_proxy_user.address )

		test_contract_params = [
			TEST_DATA.PARAMS.reserve_,
			TEST_DATA.PARAMS.maxBatch_,
			TEST_DATA.PARAMS.maxSupply_,
			TEST_DATA.PARAMS.royaltyRate_,
			TEST_DATA.PARAMS.wlMintPrice_,
			TEST_DATA.PARAMS.publicMintPrice_,
			TEST_DATA.PARAMS.name_,
			TEST_DATA.PARAMS.symbol_,
			TEST_DATA.PARAMS.baseURI_,
			// test_dev.address,
			[
				test_safe.address,
				test_charity.address,
				test_founders.address,
				test_community.address,
			],
		]
		test_contract = await deployContract( test_contract_deployer, ARTIFACT, test_contract_params )
		await test_contract.deployed()

		test_proxyRegistryAddress = test_proxy_contract.address
		await test_contract.connect( test_contract_deployer )
											 .setProxyRegistry( test_proxyRegistryAddress )

		test_newState = CST.SALE_STATE.SALE
		await test_contract.connect( test_contract_deployer )
											 .setSaleState( test_newState )

		test_qty       = TEST_DATA.TOKEN_OWNER_INIT_SUPPLY
		test_tx_params = {
			value: TEST_DATA.PARAMS.publicMintPrice_.mul( test_qty )
		}
		await test_contract.connect( test_token_owner )
											 .mint( test_qty, test_tx_params )

		test_qty       = TEST_DATA.OTHER_OWNER_SUPPLY
		test_tx_params = {
			value: TEST_DATA.PARAMS.publicMintPrice_.mul( test_qty )
		}
		await test_contract.connect( test_other_owner )
											 .mint( test_qty, test_tx_params )

		test_qty       = TEST_DATA.TOKEN_OWNER_MORE_SUPPLY
		test_tx_params = {
			value: TEST_DATA.PARAMS.publicMintPrice_.mul( test_qty )
		}
		await test_contract.connect( test_token_owner )
											 .mint( test_qty, test_tx_params )

		return {
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_contract,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_proxy_contract,
			test_contract_deployer,
		}
	}

	async function mintAndStakeFixture () {
		const [
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_proxy_contract_params = []
		test_proxy_contract = await deployContract( test_contract_deployer, PROXY, test_proxy_contract_params )
		await test_proxy_contract.deployed()
		await test_proxy_contract.setProxy( test_token_owner.address, test_proxy_user.address )

		test_contract_params = [
			TEST_DATA.PARAMS.reserve_,
			TEST_DATA.PARAMS.maxBatch_,
			TEST_DATA.PARAMS.maxSupply_,
			TEST_DATA.PARAMS.royaltyRate_,
			TEST_DATA.PARAMS.wlMintPrice_,
			TEST_DATA.PARAMS.publicMintPrice_,
			TEST_DATA.PARAMS.name_,
			TEST_DATA.PARAMS.symbol_,
			TEST_DATA.PARAMS.baseURI_,
			// test_dev.address,
			[
				test_safe.address,
				test_charity.address,
				test_founders.address,
				test_community.address,
			],
		]
		test_contract = await deployContract( test_contract_deployer, ARTIFACT, test_contract_params )
		await test_contract.deployed()

		test_proxyRegistryAddress = test_proxy_contract.address
		await test_contract.connect( test_contract_deployer )
											 .setProxyRegistry( test_proxyRegistryAddress )

		test_newState = CST.SALE_STATE.SALE
		await test_contract.connect( test_contract_deployer )
											 .setSaleState( test_newState )

		test_qty       = TEST_DATA.TOKEN_OWNER_INIT_SUPPLY
		test_qtyStaked = TEST_DATA.TOKEN_OWNER_STAKED
		test_tx_params = {
			value: TEST_DATA.PARAMS.publicMintPrice_.mul( test_qty )
		}
		await test_contract.connect( test_token_owner )
											 .mintAndStake( test_qty, test_qtyStaked, test_tx_params )

		test_qty       = TEST_DATA.OTHER_OWNER_SUPPLY
		test_qtyStaked = TEST_DATA.OTHER_OWNER_STAKED
		test_tx_params = {
			value: TEST_DATA.PARAMS.publicMintPrice_.mul( test_qty )
		}
		await test_contract.connect( test_other_owner )
											 .mintAndStake( test_qty, test_qtyStaked, test_tx_params )

		test_qty       = TEST_DATA.TOKEN_OWNER_MORE_SUPPLY
		test_tx_params = {
			value: TEST_DATA.PARAMS.publicMintPrice_.mul( test_qty )
		}
		await test_contract.connect( test_token_owner )
											 .mint( test_qty, test_tx_params )

		return {
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_contract,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_proxy_contract,
			test_contract_deployer,
		}
	}

	async function mintOutFixture () {
		const [
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_contract_deployer,
			...addrs
		] = await ethers.getSigners()

		test_proxy_contract_params = []
		test_proxy_contract = await deployContract( test_contract_deployer, PROXY, test_proxy_contract_params )
		await test_proxy_contract.deployed()
		await test_proxy_contract.setProxy( test_token_owner.address, test_proxy_user.address )

		test_contract_params = [
			TEST_DATA.MINT_OUT.PARAMS.reserve_,
			TEST_DATA.MINT_OUT.PARAMS.maxBatch_,
			TEST_DATA.MINT_OUT.PARAMS.maxSupply_,
			TEST_DATA.PARAMS.royaltyRate_,
			TEST_DATA.PARAMS.wlMintPrice_,
			TEST_DATA.PARAMS.publicMintPrice_,
			TEST_DATA.PARAMS.name_,
			TEST_DATA.PARAMS.symbol_,
			TEST_DATA.PARAMS.baseURI_,
			// test_dev.address,
			[
				test_safe.address,
				test_charity.address,
				test_founders.address,
				test_community.address,
			],
		]
		test_contract = await deployContract( test_contract_deployer, ARTIFACT, test_contract_params )
		await test_contract.deployed()

		test_proxyRegistryAddress = test_proxy_contract.address
		await test_contract.connect( test_contract_deployer )
											 .setProxyRegistry( test_proxyRegistryAddress )

		test_accounts = [
			test_token_owner.address,
			test_other_owner.address
		]
		test_amounts = [ 
			TEST_DATA.TOKEN_OWNER_CL,
			TEST_DATA.OTHER_OWNER_CL,
		]
		await test_contract.connect( test_contract_deployer )
											 .setAnonClaimList( test_accounts, test_amounts )

		test_root = TEST_DATA.PASS_ROOT.toHexString()
		await test_contract.connect( test_contract_deployer )
											 .setWhitelist( test_root )

		// test_newState = CST.SALE_STATE.PRESALE
		// await test_contract.connect( test_contract_deployer )
		// 									 .setSaleState( test_newState )

		// test_qty = TEST_DATA.TOKEN_OWNER_CL
		// await test_contract.connect( test_token_owner )
		// 									 .claim( test_qty )

		// test_qty = TEST_DATA.OTHER_OWNER_CL
		// await test_contract.connect( test_other_owner )
		// 									 .claim( test_qty )

		// test_passMax = TEST_DATA.TOKEN_OWNER_WL
		// test_proof   = generateProof( test_token_owner.address, TEST_DATA.PASS_ROOT, test_passMax )
		// test_pass    = test_proof.pass
		// test_flag    = test_proof.flag

		// test_qty       = TEST_DATA.TOKEN_OWNER_WL
		// test_tx_params = {
		// 	value : TEST_DATA.PARAMS.wlMintPrice_.mul( test_qty )
		// }
		// await test_contract.connect( test_token_owner )
		// 									 .mintPreSale( test_qty, test_pass, test_flag, test_passMax, test_tx_params )

		// test_passMax = TEST_DATA.OTHER_OWNER_WL
		// test_proof   = generateProof( test_other_owner.address, TEST_DATA.PASS_ROOT, test_passMax )
		// test_pass    = test_proof.pass
		// test_flag    = test_proof.flag

		// test_qty       = TEST_DATA.OTHER_OWNER_WL
		// test_tx_params = {
		// 	value : TEST_DATA.PARAMS.wlMintPrice_.mul( test_qty )
		// }
		// await test_contract.connect( test_other_owner )
		// 									 .mintPreSale( test_qty, test_pass, test_flag, test_passMax, test_tx_params )

		test_newState = CST.SALE_STATE.SALE
		await test_contract.connect( test_contract_deployer )
											 .setSaleState( test_newState )

		test_qty       = TEST_DATA.MINT_OUT.MINT_QTY
		test_tx_params = {
			value: TEST_DATA.PARAMS.publicMintPrice_.mul( test_qty )
		}
		await test_contract.connect( test_token_owner )
											 .mint( test_qty, test_tx_params )

		// test_qty       = TEST_DATA.OTHER_OWNER_SUPPLY
		// test_tx_params = {
		// 	value: TEST_DATA.PARAMS.publicMintPrice_.mul( test_qty )
		// }
		// await test_contract.connect( test_other_owner )
		// 									 .mint( test_qty, test_tx_params )

		return {
			test_dev,
			test_safe,
			test_user1,
			test_user2,
			test_charity,
			test_contract,
			test_founders,
			test_community,
			test_proxy_user,
			test_token_owner,
			test_other_owner,
			test_proxy_contract,
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
						test_dev,
						test_safe,
						test_user1,
						test_user2,
						test_charity,
						test_contract,
						test_founders,
						test_community,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ 'DEV'             ] = test_dev
					users[ 'SAFE'            ] = test_safe
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ 'CHARITY'         ] = test_charity
					users[ 'FOUNDERS'        ] = test_founders
					users[ 'COMMUNITY'       ] = test_community
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer

					const proof = generateProof( users[ TOKEN_OWNER ].address, test_data.PASS_ROOT, test_data.TOKEN_OWNER_SUPPLY )

					defaultArgs = {}
					// **************************************
					// *****           PUBLIC           *****
					// **************************************
						defaultArgs[ CONTRACT.METHODS.approve.SIGNATURE ] = {
							err  : null,
							args : [
								users[ USER1 ].address,
								0,
							],
						}
						defaultArgs[ CONTRACT.METHODS.claim.SIGNATURE ] = {
							err  : null,
							args : [
								1,
							],
						}
						defaultArgs[ CONTRACT.METHODS.claimAndStake.SIGNATURE ] = {
							err  : null,
							args : [
								1,
								1,
							],
						}
						defaultArgs[ CONTRACT.METHODS.mintPreSale.SIGNATURE ] = {
							err  : null,
							args : [
								1,
								proof.pass,
								proof.flag,
								test_data.TOKEN_OWNER_SUPPLY,
							],
						}
						defaultArgs[ CONTRACT.METHODS.mintPreSaleAndStake.SIGNATURE ] = {
							err  : null,
							args : [
								1,
								proof.pass,
								proof.flag,
								test_data.TOKEN_OWNER_SUPPLY,
								1,
							],
						}
						defaultArgs[ CONTRACT.METHODS.mint.SIGNATURE ] = {
							err  : null,
							args : [
								1,
							],
						}
						defaultArgs[ CONTRACT.METHODS.mintAndStake.SIGNATURE ] = {
							err  : null,
							args : [
								1,
								1,
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
						defaultArgs[ CONTRACT.METHODS.stake.SIGNATURE ] = {
							err  : null,
							args : [
								0,
							]
						}
						defaultArgs[ CONTRACT.METHODS.transferFrom.SIGNATURE ] = {
							err  : null,
							args : [
								users[ TOKEN_OWNER ].address,
								users[ USER1 ].address,
								0,
							],
						}
						defaultArgs[ CONTRACT.METHODS.unstake.SIGNATURE ] = {
							err  : null,
							args : [
								0,
							]
						}
					// **************************************

					// **************************************
					// *****       CONTRACT_OWNER       *****
					// **************************************
						defaultArgs[ CONTRACT.METHODS.setAnonClaimList.SIGNATURE ] = {
							err  : null,
							args : [
								[
									users[ TOKEN_OWNER ],
									users[ USER1 ],
								],
								[ 1, 2 ],
							],
						}
						defaultArgs[ CONTRACT.METHODS.setWhitelist.SIGNATURE ] = {
							err  : null,
							args : [
								test_data.PASS_ROOT,
							],
						}
						defaultArgs[ CONTRACT.METHODS.airdrop.SIGNATURE ] = {
							err  : null,
							args : [
								[
									users[ TOKEN_OWNER ],
									users[ USER1 ],
								],
								[ 1, 2 ],
							],
						}
						defaultArgs[ CONTRACT.METHODS.setProxyRegistry.SIGNATURE ] = {
							err  : null,
							args : [
								test_proxy_contract.address,
							]
						}
						defaultArgs[ CONTRACT.METHODS.setRoyaltyInfo.SIGNATURE ] = {
							err  : null,
							args : [
								users[ CONTRACT_DEPLOYER ].address,
								test_data.PARAMS.royaltyRate_,
							],
						}
						defaultArgs[ CONTRACT.METHODS.setSaleState.SIGNATURE ] = {
							err  : null,
							args : [
								CST.SALE_STATE.SALE,
							],
						}
						defaultArgs[ CONTRACT.METHODS.transferOwnership.SIGNATURE ] = {
							err  : null,
							args : [
								users[ USER1 ].address,
							]
						}
						defaultArgs[ CONTRACT.METHODS.withdraw.SIGNATURE ] = {
							err  : null,
							args : [],
						}
					// **************************************

					// **************************************
					// *****            VIEW            *****
					// **************************************
						defaultArgs[ CONTRACT.METHODS.balanceOf.SIGNATURE ] = {
							err  : null,
							args : [
								users[ TOKEN_OWNER ].address,
							],
						}
						defaultArgs[ CONTRACT.METHODS.balanceOfStaked.SIGNATURE ] = {
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
						defaultArgs[ CONTRACT.METHODS.owner.SIGNATURE ] = {
							err  : null,
							args : []
						}
						defaultArgs[ CONTRACT.METHODS.ownerOf.SIGNATURE ] = {
							err  : null,
							args : [
								0,
							],
						}
						defaultArgs[ CONTRACT.METHODS.ownerOfStaked.SIGNATURE ] = {
							err  : null,
							args : [
								0,
							],
						}
						defaultArgs[ CONTRACT.METHODS.royaltyInfo.SIGNATURE ] = {
							err  : null,
							args : [
								0,
								CST.ONE_ETH,
							],
						}
						defaultArgs[ CONTRACT.METHODS.saleState.SIGNATURE ] = {
							err  : null,
							args : [],
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
					// **************************************

					// **************************************
					// *****            PURE            *****
					// **************************************
						defaultArgs[ CONTRACT.METHODS.onERC721Received.SIGNATURE ] = {
							err  : null,
							args : [
								users[ TOKEN_OWNER ].address,
								contract.address,
								0,
								CST.HASH_ZERO,
							],
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

	function shouldBehaveLikeCCFoundersKeysAtDeploy ( fixture, test_data ) {
		describe( 'Should behave like CCFoundersKeys at deploy', function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_dev,
						test_safe,
						test_user1,
						test_user2,
						test_charity,
						test_contract,
						test_founders,
						test_community,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ 'DEV'             ] = test_dev
					users[ 'SAFE'            ] = test_safe
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ 'CHARITY'         ] = test_charity
					users[ 'FOUNDERS'        ] = test_founders
					users[ 'COMMUNITY'       ] = test_community
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****       CONTRACT_OWNER       *****
				// **************************************
					describe( CONTRACT.METHODS.airdrop.SIGNATURE, function () {
						if ( TEST.METHODS.airdrop ) {
							it( 'Transaction initiated by a regular user should be reverted with ' + ERROR.IOwnable_NOT_OWNER, async function () {
								const accounts = [
									users[ USER1 ].address,
									users[ USER2 ].address,
								]
								const amounts = [
									test_data.AIRDROP1,
									test_data.AIRDROP2,
								]
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.airdrop( accounts, amounts )
								)
							})

							it( 'Inputing arrays of different lengths should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_ARRAY_LENGTH_MISMATCH, async function () {
								const accounts = [
									users[ USER1 ].address,
									users[ USER2 ].address,
								]
								const amounts = [
									test_data.AIRDROP1,
								]
								await expect(
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.airdrop( accounts, amounts )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_ARRAY_LENGTH_MISMATCH )
							})

							describe( USER_NAMES[ CONTRACT_DEPLOYER ] + ' airdrops a few tokens', async function () {
								beforeEach( async function () {
									const accounts = [
										users[ USER1 ].address,
										users[ USER2 ].address,
									]
									const amounts = [
										test_data.AIRDROP1,
										test_data.AIRDROP2,
									]
									await contract.connect( users[ CONTRACT_DEPLOYER ] )
																.airdrop( accounts, amounts )
								})

								it( 'Balance of ' + USER_NAMES[ USER1 ] + ' should be ' + test_data.AIRDROP1, async function () {
									const tokenOwner = users[ USER1 ].address
									expect(
										await contract.balanceOf( tokenOwner )
									).to.equal( test_data.AIRDROP1 )
								})

								it( 'Balance of ' + USER_NAMES[ USER2 ] + ' should be ' + test_data.AIRDROP1, async function () {
									const tokenOwner = users[ USER2 ].address
									expect(
										await contract.balanceOf( tokenOwner )
									).to.equal( test_data.AIRDROP2 )
								})
							})
						}
					})

					describe( CONTRACT.METHODS.setAnonClaimList.SIGNATURE, function () {
						if ( TEST.METHODS.setAnonClaimList ) {
							it( 'Transaction initiated by a regular user should be reverted with ' + ERROR.IOwnable_NOT_OWNER, async function () {
								const accounts = [
									users[ TOKEN_OWNER ].address,
									users[ OTHER_OWNER ].address,
								]
								const amounts = [
									test_data.TOKEN_OWNER_SUPPLY,
									test_data.OTHER_OWNER_SUPPLY,
								]
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.setAnonClaimList( accounts, amounts )
								)
							})

							it( 'Inputing arrays of different lengths should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_ARRAY_LENGTH_MISMATCH, async function () {
								const accounts = [
									users[ TOKEN_OWNER ].address,
									users[ OTHER_OWNER ].address,
								]
								const amounts = [
									test_data.TOKEN_OWNER_SUPPLY,
								]
								await expect(
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.setAnonClaimList( accounts, amounts )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_ARRAY_LENGTH_MISMATCH )
							})
						}
					})

					describe( CONTRACT.METHODS.setProxyRegistry.SIGNATURE, function () {
						if ( TEST.METHODS.setProxyRegistry ) {
							it( 'Transaction initiated by a regular user should be reverted with ' + ERROR.IOwnable_NOT_OWNER, async function () {
								const proxyRegistryAddress = proxy_contract.address
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.setProxyRegistry( proxyRegistryAddress )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.setRoyaltyInfo.SIGNATURE, function () {
						if ( TEST.METHODS.setRoyaltyInfo ) {
							it( 'Transaction initiated by a regular user should be reverted with ' + ERROR.IOwnable_NOT_OWNER, async function () {
								const royaltyRecipient = users[ USER1 ].address
								const royaltyRate      = test_data.PARAMS.royaltyRate_ * 2
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.setRoyaltyInfo( royaltyRecipient, royaltyRate )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.setSaleState.SIGNATURE, function () {
						if ( TEST.METHODS.setSaleState ) {
							it( 'Transaction initiated by a regular user should be reverted with ' + ERROR.IOwnable_NOT_OWNER, async function () {
								const newState = CST.SALE_STATE.SALE
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.setSaleState( newState )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.setWhitelist.SIGNATURE, function () {
						if ( TEST.METHODS.setWhitelist ) {
							it( 'Transaction initiated by a regular user should be reverted with ' + ERROR.IOwnable_NOT_OWNER, async function () {
								const root = test_data.PASS_ROOT
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.setWhitelist( root )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.withdraw.SIGNATURE, function () {
						if ( TEST.METHODS.withdraw ) {
							it( 'Transaction initiated by a regular user should be reverted with ' + ERROR.IOwnable_NOT_OWNER, async function () {
								await shouldRevertWhenCallerIsNotContractOwner(
									contract.connect( users[ USER1 ] )
													.withdraw()
								)
							})

							it( 'Withdraw with no funds in the contract should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_NO_ETHER_BALANCE, async function () {
								await expect (
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.withdraw()
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_NO_ETHER_BALANCE )
							})
						}
					})
				// **************************************

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.claim.SIGNATURE, function () {
						if ( TEST.METHODS.claim ) {
							it( 'Transaction initiated with sale state CLOSE should be reverted with ' + ERROR.IPausable_PRESALE_NOT_OPEN, async function () {
								const qty = test_data.TOKEN_OWNER_SUPPLY
								await shouldRevertWhenSaleStateIsNotPreSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.claim( qty )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.claimAndStake.SIGNATURE, function () {
						if ( TEST.METHODS.claimAndStake ) {
							it( 'Transaction initiated with sale state CLOSE should be reverted with ' + ERROR.IPausable_PRESALE_NOT_OPEN, async function () {
								const qty       = test_data.TOKEN_OWNER_CL
								const qtyStaked = 1
								await shouldRevertWhenSaleStateIsNotPreSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.claimAndStake( qty, qtyStaked )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.mintPreSale.SIGNATURE, function () {
						if ( TEST.METHODS.mintPreSale ) {
							it( 'Transaction initiated with sale state CLOSE should be reverted with ' + ERROR.IPausable_PRESALE_NOT_OPEN, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty )
								}
								await shouldRevertWhenSaleStateIsNotPreSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSale( qty, pass, flag, passMax, tx_params )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.mintPreSaleAndStake.SIGNATURE, function () {
						if ( TEST.METHODS.mintPreSaleAndStake ) {
							it( 'Transaction initiated with sale state CLOSE should be reverted with ' + ERROR.IPausable_PRESALE_NOT_OPEN, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const qty       = test_data.TOKEN_OWNER_WL
								const pass      = proof.pass
								const flag      = proof.flag	
								const qtyStaked = 1
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty )
								}
								await shouldRevertWhenSaleStateIsNotPreSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked, tx_params )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.mint.SIGNATURE, function () {
						if ( TEST.METHODS.mint ) {
							it( 'Transaction initiated with sale state CLOSE should be reverted with ' + ERROR.IPausable_SALE_NOT_OPEN, async function () {
								const qty       = test_data.TOKEN_OWNER_SUPPLY
								const tx_params = {
									value : test_data.PARAMS.publicMintPrice_.mul( qty )
								}
								await shouldRevertWhenSaleStateIsNotSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.mint( qty, tx_params )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.mintAndStake.SIGNATURE, function () {
						if ( TEST.METHODS.mintAndStake ) {
							it( 'Transaction initiated with sale state CLOSE should be reverted with ' + ERROR.IPausable_SALE_NOT_OPEN, async function () {
								const qty       = test_data.TOKEN_OWNER_CL
								const qtyStaked = 1
								const tx_params = {
									value : test_data.PARAMS.publicMintPrice_.mul( qty )
								}
								await shouldRevertWhenSaleStateIsNotSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintAndStake( qty, qtyStaked, tx_params )
								)
							})
						}
					})
				// **************************************

				// **************************************
				// *****            VIEW            *****
				// **************************************
					describe( CONTRACT.METHODS.balanceOf.SIGNATURE, function () {
						if ( TEST.METHODS.balanceOf ) {
							it( 'Dev should own ' + test_data.INIT_SUPPLY + ' tokens', async function () {
								const tokenOwner = users[ 'DEV' ].address
								expect(
									await contract.balanceOf( tokenOwner )
								).to.equal( test_data.INIT_SUPPLY )
							})
						}
					})

					describe( CONTRACT.METHODS.balanceOfStaked.SIGNATURE, function () {
						if ( TEST.METHODS.balanceOfStaked ) {
							it( USER_NAMES[ CONTRACT_DEPLOYER ] + ' should have 0 tokens staked', async function () {
								const tokenOwner = users[ CONTRACT_DEPLOYER ].address
								expect(
									await contract.balanceOfStaked( tokenOwner )
								).to.equal( 0 )
							})

							it( 'The NULL address should have 0 tokens staked', async function () {
								const tokenOwner = CST.ADDRESS_ZERO
								expect(
									await contract.balanceOfStaked( tokenOwner )
								).to.equal( 0 )
							})

							it( 'Dev should have ' + test_data.INIT_SUPPLY + ' tokens staked', async function () {
								const tokenOwner = users[ 'DEV' ].address
								expect(
									await contract.balanceOfStaked( tokenOwner )
								).to.equal( test_data.INIT_SUPPLY )
							})
						}
					})

					describe( CONTRACT.METHODS.ownerOf.SIGNATURE, function () {
						if ( TEST.METHODS.ownerOf ) {
							it( 'Contract should own tokens number ' + test_data.FIRST_TOKEN + ' to ' + ( test_data.FIRST_TOKEN + test_data.INIT_SUPPLY - 1 ).toString(), async function () {
								const firstId = test_data.FIRST_TOKEN
								const lastId  = test_data.FIRST_TOKEN + test_data.INIT_SUPPLY
								for ( i = firstId; i < lastId; i ++ ) {
									const tokenId = i
									expect(
										await contract.ownerOf( tokenId )
									).to.equal( contract.address )
								}
							})
						}
					})

					describe( CONTRACT.METHODS.ownerOfStaked.SIGNATURE, function () {
						if ( TEST.METHODS.ownerOfStaked ) {
							it( 'Requesting unminted token should be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async function () {
								const tokenId = test_data.UNMINTED_TOKEN
								await shouldRevertWhenRequestedTokenDoesNotExist(
									contract.ownerOfStaked( tokenId )
								)
							})

							it( 'Dev should be registered as owner of staked tokens number ' + test_data.FIRST_TOKEN + ' to ' + ( test_data.FIRST_TOKEN + test_data.INIT_SUPPLY - 1 ).toString(), async function () {
								const firstId = test_data.FIRST_TOKEN
								const lastId  = test_data.FIRST_TOKEN + test_data.INIT_SUPPLY
								for ( i = firstId; i < lastId; i ++ ) {
									const tokenId = i
									expect(
										await contract.ownerOfStaked( tokenId )
									).to.equal( users[ 'DEV' ].address )
								}
							})
						}
					})

					describe( CONTRACT.METHODS.royaltyInfo.SIGNATURE, function () {
						if ( TEST.METHODS.royaltyInfo ) {
							it( 'Requesting unminted token should be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async function () {
								const tokenId   = test_data.UNMINTED_TOKEN
								const salePrice = CST.ONE_ETH
								await shouldRevertWhenRequestedTokenDoesNotExist(
									contract.royaltyInfo( tokenId, salePrice )
								)
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeCCFoundersKeysAfterSettingProxy ( fixture, test_data ) {
		describe( 'Should behave like CCFoundersKeys after setting proxy', function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_dev,
						test_safe,
						test_user1,
						test_user2,
						test_charity,
						test_contract,
						test_founders,
						test_community,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ 'DEV'             ] = test_dev
					users[ 'SAFE'            ] = test_safe
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ 'CHARITY'         ] = test_charity
					users[ 'FOUNDERS'        ] = test_founders
					users[ 'COMMUNITY'       ] = test_community
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****            VIEW            *****
				// **************************************
					describe( CONTRACT.METHODS.isApprovedForAll.SIGNATURE, function () {
						if ( TEST.METHODS.isApprovedForAll ) {
							it( 'Despite not being expressely authorized, ' + USER_NAMES[ PROXY_USER ] + ' can manage tokens on behalf of ' + USER_NAMES[ TOKEN_OWNER ], async function () {
								const tokenOwner = users[ TOKEN_OWNER ].address
								const operator   = users[ PROXY_USER ].address
								expect(
									await contract.isApprovedForAll( tokenOwner, operator )
								).to.be.true
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeCCFoundersKeysAfterSettingPreSale ( fixture, test_data ) {
		describe( 'Should behave like CCFoundersKeys after setting preSale', function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_dev,
						test_safe,
						test_user1,
						test_user2,
						test_charity,
						test_contract,
						test_founders,
						test_community,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ 'DEV'             ] = test_dev
					users[ 'SAFE'            ] = test_safe
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ 'CHARITY'         ] = test_charity
					users[ 'FOUNDERS'        ] = test_founders
					users[ 'COMMUNITY'       ] = test_community
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.claim.SIGNATURE, function () {
						if ( TEST.METHODS.claim ) {
							it( 'Transaction initiated with sale state PRESALE and claim list unset should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN, async function () {
								const qty = test_data.TOKEN_OWNER_CL
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.claim( qty )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN )
							})
						}
					})

					describe( CONTRACT.METHODS.claimAndStake.SIGNATURE, function () {
						if ( TEST.METHODS.claimAndStake ) {
							it( 'Transaction initiated with sale state PRESALE and claim list unset should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN, async function () {
								const qty       = test_data.TOKEN_OWNER_CL
								const qtyStaked = 1
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.claimAndStake( qty, qtyStaked )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN )
							})
						}
					})

					describe( CONTRACT.METHODS.mintPreSale.SIGNATURE, function () {
						if ( TEST.METHODS.mintPreSale ) {
							it( 'Transaction initiated with sale state CLOSE and whitelist unset should be reverted with ' + ERROR.IWhitelistable_NOT_SET, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty )
								}
								await shouldRevertWhenWitelistIsNotSet(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSale( qty, pass, flag, passMax, tx_params )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.mintPreSaleAndStake.SIGNATURE, function () {
						if ( TEST.METHODS.mintPreSaleAndStake ) {
							it( 'Transaction initiated with sale state CLOSE and whitelist unset should be reverted with ' + ERROR.IWhitelistable_NOT_SET, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL
								const qtyStaked = 1
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty )
								}
								await shouldRevertWhenWitelistIsNotSet(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked, tx_params )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.mint.SIGNATURE, function () {
						if ( TEST.METHODS.mint ) {
							it( 'Transaction initiated with sale state PRESALE should be reverted with ' + ERROR.IPausable_SALE_NOT_OPEN, async function () {
								const qty       = test_data.TOKEN_OWNER_SUPPLY
								const tx_params = {
									value : test_data.PARAMS.publicMintPrice_.mul( qty )
								}
								await shouldRevertWhenSaleStateIsNotSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.mint( qty, tx_params )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.mintAndStake.SIGNATURE, function () {
						if ( TEST.METHODS.mintAndStake ) {
							it( 'Transaction initiated with sale state PRESALE should be reverted with ' + ERROR.IPausable_SALE_NOT_OPEN, async function () {
								const qty       = test_data.TOKEN_OWNER_CL
								const qtyStaked = 1
								const tx_params = {
									value : test_data.PARAMS.publicMintPrice_.mul( qty )
								}
								await shouldRevertWhenSaleStateIsNotSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintAndStake( qty, qtyStaked, tx_params )
								)
							})
						}
					})
				// **************************************

				// **************************************
				// *****       CONTRACT_OWNER       *****
				// **************************************
					describe( CONTRACT.METHODS.setAnonClaimList.SIGNATURE, function () {
						if ( TEST.METHODS.setAnonClaimList ) {
							it( 'Transaction initiated with sale state PRESALE should be reverted with ' + ERROR.IPausable_SALE_NOT_CLOSED, async function () {
								const accounts = [
									users[ TOKEN_OWNER ].address,
									users[ OTHER_OWNER ].address,
								]
								const amounts = [
									test_data.TOKEN_OWNER_CL,
									test_data.OTHER_OWNER_CL,
								]
								await shouldRevertWhenSaleStateIsNotClose(
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.setAnonClaimList( accounts, amounts )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.setWhitelist.SIGNATURE, function () {
						if ( TEST.METHODS.setWhitelist ) {
							it( 'Transaction initiated with sale state PRESALE should be reverted with ' + ERROR.IPausable_SALE_NOT_CLOSED, async function () {
								const root = test_data.PASS_ROOT
								await shouldRevertWhenSaleStateIsNotClose(
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.setWhitelist( root )
								)
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeCCFoundersKeysAfterSettingAnonClaimList ( fixture, test_data ) {
		describe( 'Should behave like CCFoundersKeys after setting anon claim list', function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_dev,
						test_safe,
						test_user1,
						test_user2,
						test_charity,
						test_contract,
						test_founders,
						test_community,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ 'DEV'             ] = test_dev
					users[ 'SAFE'            ] = test_safe
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ 'CHARITY'         ] = test_charity
					users[ 'FOUNDERS'        ] = test_founders
					users[ 'COMMUNITY'       ] = test_community
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.claim.SIGNATURE, function () {
						if ( TEST.METHODS.claim ) {
							it( 'Non whitelisted user trying to claim tokens should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN, async function () {
								const qty = test_data.TOKEN_OWNER_CL
								await expect(
									contract.connect( users[ USER1 ] )
													.claim( qty )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN )
							})

							it( 'Whitelisted user trying to claim more tokens than allowed in one transaction should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN, async function () {
								const qty = test_data.TOKEN_OWNER_CL + 1
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.claim( qty )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN )
							})

							describe( 'Whitelisted user claims a token', async function () {
								beforeEach( async function () {
									const qty = 1
									await contract.connect( users[ TOKEN_OWNER ] )
																.claim( qty )
								})

								it( 'Whitelisted user trying to claim more tokens than allowed in several transaction should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN, async function () {
									const qty = test_data.TOKEN_OWNER_CL
									await expect(
										contract.connect( users[ TOKEN_OWNER ] )
														.claim( qty )
									).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN )
								})
							})
						}
					})

					describe( CONTRACT.METHODS.claimAndStake.SIGNATURE, function () {
						if ( TEST.METHODS.claimAndStake ) {
							it( 'Non whitelisted user trying to claim tokens should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN, async function () {
								const qty       = test_data.TOKEN_OWNER_CL
								const qtyStaked = 1
								await expect(
									contract.connect( users[ USER1 ] )
													.claimAndStake( qty, qtyStaked )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN )
							})

							it( 'Whitelisted user trying to claim more tokens than allowed in one transaction should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN, async function () {
								const qty       = test_data.TOKEN_OWNER_CL + 1
								const qtyStaked = 1
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.claimAndStake( qty, qtyStaked )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN )
							})

							it( 'Whitelisted user trying to stake more tokens than claimed should only stake the amount claimed', async function () {
								const qty       = 1
								const qtyStaked = qty + 1
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.claimAndStake( qty, qtyStaked )
								).to.be.fulfilled
								const tokenOwner = users[ TOKEN_OWNER ].address
								expect(
									await contract.balanceOfStaked( tokenOwner )
								).to.equal( qty )
							})

							describe( 'Whitelisted user claims a token', function () {
								beforeEach( async function () {
									const qty = 1
									const qtyStaked = 0
									await contract.connect( users[ TOKEN_OWNER ] )
																.claimAndStake( qty, qtyStaked )
								})

								it( 'Whitelisted user trying to claim more tokens than allowed in several transaction should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN, async function () {
									const qty       = test_data.TOKEN_OWNER_CL
									const qtyStaked = 1
									await expect(
										contract.connect( users[ TOKEN_OWNER ] )
														.claimAndStake( qty, qtyStaked )
									).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN )
								})
							})

							describe( 'Whitelisted user claims all their tokens', async function () {
								beforeEach( async function () {
									const qty       = test_data.OTHER_OWNER_CL
									const qtyStaked = 1
									await contract.connect( users[ OTHER_OWNER ] )
																.claimAndStake( qty, qtyStaked )
								})

								it( 'Whitelisted user trying to claim more tokens should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN, async function () {
									const qty       = 1
									const qtyStaked = 1
									await expect(
										contract.connect( users[ OTHER_OWNER ] )
														.claimAndStake( qty, qtyStaked )
									).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_FORBIDDEN )
								})
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeCCFoundersKeysAfterSettingWhitelist ( fixture, test_data ) {
		describe( 'Should behave like CCFoundersKeys after setting whitelist', function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_dev,
						test_safe,
						test_user1,
						test_user2,
						test_charity,
						test_contract,
						test_founders,
						test_community,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ 'DEV'             ] = test_dev
					users[ 'SAFE'            ] = test_safe
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ 'CHARITY'         ] = test_charity
					users[ 'FOUNDERS'        ] = test_founders
					users[ 'COMMUNITY'       ] = test_community
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.mintPreSale.SIGNATURE, function () {
						if ( TEST.METHODS.mintPreSale ) {
							it( 'Non whitelisted user trying to mint presale tokens should be reverted with ' + ERROR.IWhitelistable_FORBIDDEN, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty )
								}
								await shouldRevertWhenNotWhitelisted(
									contract.connect( users[ USER1 ] )
													.mintPreSale( qty, pass, flag, passMax, tx_params )
								)
							})

							it( 'Whitelisted user trying to mint more presale tokens than allowed in one transaction should be reverted with ' + ERROR.IWhitelistable_FORBIDDEN, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL + 1
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty )
								}
								await shouldRevertWhenNotWhitelisted(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSale( qty, pass, flag, passMax, tx_params )
								)
							})

							it( 'Whitelisted user trying to mint presale tokens without paying enough should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSale( qty, pass, flag, passMax )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE )
							})

							it( 'Whitelisted user trying to mint presale tokens by paying too much should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty ).add( 1 )
								}
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSale( qty, pass, flag, passMax, tx_params )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE )
							})

							describe( 'Whitelisted user consumes a whitelist spot', function () {
								beforeEach( async function () {
									const passMax   = test_data.TOKEN_OWNER_WL
									const account   = users[ TOKEN_OWNER ].address
									const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
									const pass      = proof.pass
									const flag      = proof.flag
									const qty       = 1
									const tx_params = {
										value : test_data.PARAMS.wlMintPrice_.mul( qty )
									}
									await contract.connect( users[ TOKEN_OWNER ] )
												.mintPreSale( qty, pass, flag, passMax, tx_params )
								})

								it( 'Whitelisted user trying to mint more presale tokens than allowed in several transaction should be reverted with ' + ERROR.IWhitelistable_FORBIDDEN, async function () {
									const passMax   = test_data.TOKEN_OWNER_WL
									const account   = users[ TOKEN_OWNER ].address
									const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
									const pass      = proof.pass
									const flag      = proof.flag
									const qty       = test_data.TOKEN_OWNER_WL
									const tx_params = {
										value : test_data.PARAMS.wlMintPrice_.mul( qty )
									}
									await shouldRevertWhenNotWhitelisted(
										contract.connect( users[ TOKEN_OWNER ] )
														.mintPreSale( qty, pass, flag, passMax, tx_params )
									)
								})
							})

							describe( 'Whitelisted user consumes all their whitelist spots', function () {
								beforeEach( async function () {
									const passMax   = test_data.OTHER_OWNER_WL
									const account   = users[ OTHER_OWNER ].address
									const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
									const pass      = proof.pass
									const flag      = proof.flag
									const qty       = test_data.OTHER_OWNER_WL
									const tx_params = {
										value : test_data.PARAMS.wlMintPrice_.mul( qty )
									}
									await contract.connect( users[ OTHER_OWNER ] )
																.mintPreSale( qty, pass, flag, passMax, tx_params )
								})

								it( 'Whitelisted user trying to mint more presale tokens should be reverted with ' + ERROR.IWhitelistable_CONSUMED, async function () {
									const passMax   = test_data.OTHER_OWNER_WL
									const account   = users[ OTHER_OWNER ].address
									const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
									const pass      = proof.pass
									const flag      = proof.flag
									const qty       = 1
									const tx_params = {
										value : test_data.PARAMS.wlMintPrice_.mul( qty )
									}
									await shouldRevertWhenWhitelistIsConsumed(
										contract.connect( users[ OTHER_OWNER ] )
														.mintPreSale( qty, pass, flag, passMax, tx_params )
									)
								})
							})
						}
					})

					describe( CONTRACT.METHODS.mintPreSaleAndStake.SIGNATURE, function () {
						if ( TEST.METHODS.mintPreSaleAndStake ) {
							it( 'Non whitelisted user trying to mint presale tokens should be reverted with ' + ERROR.IWhitelistable_FORBIDDEN, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL
								const qtyStaked = 1
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty )
								}
								await shouldRevertWhenNotWhitelisted(
									contract.connect( users[ USER1 ] )
													.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked, tx_params )
								)
							})

							it( 'Whitelisted user trying to mint more presale tokens than allowed in one transaction should be reverted with ' + ERROR.IWhitelistable_FORBIDDEN, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL + 1
								const qtyStaked = 1
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty )
								}
								await shouldRevertWhenNotWhitelisted(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked, tx_params )
								)
							})

							it( 'Whitelisted user trying to mint presale tokens without paying enough should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL
								const qtyStaked = 1
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE )
							})

							it( 'Whitelisted user trying to mint presale tokens by paying too much should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL
								const qtyStaked = 1
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty ).add( 1 )
								}
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked, tx_params )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE )
							})

							it( 'Whitelisted user trying to stake more tokens than minted should only stake the amount minted', async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = 1
								const qtyStaked = qty + 1
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty )
								}
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked, tx_params )
								).to.be.fulfilled
								const tokenOwner = users[ TOKEN_OWNER ].address
								expect(
									await contract.balanceOfStaked( tokenOwner )
								).to.equal( qty )
							})

							describe( 'Whitelisted user consumes a whitelist spot', function () {
								beforeEach( async function () {
									const passMax   = test_data.TOKEN_OWNER_WL
									const account   = users[ TOKEN_OWNER ].address
									const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
									const pass      = proof.pass
									const flag      = proof.flag
									const qty       = 1
									const qtyStaked = 0
									const tx_params = {
										value : test_data.PARAMS.wlMintPrice_.mul( qty )
									}
									await contract.connect( users[ TOKEN_OWNER ] )
												.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked, tx_params )
								})

								it( 'Whitelisted user trying to mint more presale tokens than allowed in several transaction should be reverted with ' + ERROR.IWhitelistable_FORBIDDEN, async function () {
									const passMax   = test_data.TOKEN_OWNER_WL
									const account   = users[ TOKEN_OWNER ].address
									const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
									const pass      = proof.pass
									const flag      = proof.flag
									const qty       = test_data.TOKEN_OWNER_WL
									const qtyStaked = 1
									const tx_params = {
										value : test_data.PARAMS.wlMintPrice_.mul( qty )
									}
									await shouldRevertWhenNotWhitelisted(
										contract.connect( users[ TOKEN_OWNER ] )
														.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked, tx_params )
									)
								})
							})

							describe( 'Whitelisted user consumes all their whitelist spots', function () {
								beforeEach( async function () {
									const passMax   = test_data.OTHER_OWNER_WL
									const account   = users[ OTHER_OWNER ].address
									const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
									const pass      = proof.pass
									const flag      = proof.flag
									const qty       = test_data.OTHER_OWNER_WL
									const qtyStaked = 1
									const tx_params = {
										value : test_data.PARAMS.wlMintPrice_.mul( qty )
									}
									await contract.connect( users[ OTHER_OWNER ] )
																.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked, tx_params )
								})

								it( 'Whitelisted user trying to mint more presale tokens should be reverted with ' + ERROR.IWhitelistable_CONSUMED, async function () {
									const passMax   = test_data.OTHER_OWNER_WL
									const account   = users[ OTHER_OWNER ].address
									const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
									const pass      = proof.pass
									const flag      = proof.flag
									const qty       = 1
									const qtyStaked = 1
									const tx_params = {
										value : test_data.PARAMS.wlMintPrice_.mul( qty )
									}
									await shouldRevertWhenWhitelistIsConsumed(
										contract.connect( users[ OTHER_OWNER ] )
														.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked, tx_params )
									)
								})
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeCCFoundersKeysAfterSettingSale ( fixture, test_data ) {
		describe( 'Should behave like CCFoundersKeys after setting sale', function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_dev,
						test_safe,
						test_user1,
						test_user2,
						test_charity,
						test_contract,
						test_founders,
						test_community,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ 'DEV'             ] = test_dev
					users[ 'SAFE'            ] = test_safe
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ 'CHARITY'         ] = test_charity
					users[ 'FOUNDERS'        ] = test_founders
					users[ 'COMMUNITY'       ] = test_community
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.claim.SIGNATURE, function () {
						if ( TEST.METHODS.claim ) {
							it( 'Transaction initiated with sale state SALE should be reverted with ' + ERROR.IPausable_PRESALE_NOT_OPEN, async function () {
								const qty = test_data.TOKEN_OWNER_SUPPLY
								await shouldRevertWhenSaleStateIsNotPreSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.claim( qty )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.claimAndStake.SIGNATURE, function () {
						if ( TEST.METHODS.claimAndStake ) {
							it( 'Transaction initiated with sale state SALE should be reverted with ' + ERROR.IPausable_PRESALE_NOT_OPEN, async function () {
								const qty       = test_data.TOKEN_OWNER_CL
								const qtyStaked = 1
								await shouldRevertWhenSaleStateIsNotPreSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.claimAndStake( qty, qtyStaked )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.mintPreSale.SIGNATURE, function () {
						if ( TEST.METHODS.mintPreSale ) {
							it( 'Transaction initiated with sale state SALE should be reverted with ' + ERROR.IPausable_PRESALE_NOT_OPEN, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty )
								}
								await shouldRevertWhenSaleStateIsNotPreSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSale( qty, pass, flag, passMax, tx_params )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.mintPreSaleAndStake.SIGNATURE, function () {
						if ( TEST.METHODS.mintPreSaleAndStake ) {
							it( 'Transaction initiated with sale state SALE should be reverted with ' + ERROR.IPausable_PRESALE_NOT_OPEN, async function () {
								const passMax   = test_data.TOKEN_OWNER_WL
								const account   = users[ TOKEN_OWNER ].address
								const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
								const pass      = proof.pass
								const flag      = proof.flag
								const qty       = test_data.TOKEN_OWNER_WL
								const qtyStaked = 1
								const tx_params = {
									value : test_data.PARAMS.wlMintPrice_.mul( qty )
								}
								await shouldRevertWhenSaleStateIsNotPreSale(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked, tx_params )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.mint.SIGNATURE, function () {
						if ( TEST.METHODS.mint ) {
							it( 'User trying to mint more tokens than allowed in one transaction should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_MAX_BATCH, async function () {
								const qty       = test_data.PARAMS.maxBatch_ + 1
								const tx_params = {
									value : test_data.PARAMS.publicMintPrice_.mul( qty )
								}
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.mint( qty, tx_params )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_MAX_BATCH )
							})

							it( 'User trying to mint without paying enough should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE, async function () {
								const qty = test_data.TOKEN_OWNER_SUPPLY
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.mint( qty )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE )
							})

							it( 'User trying to mint by paying too much should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE, async function () {
								const qty       = test_data.TOKEN_OWNER_SUPPLY
								const tx_params = {
									value : test_data.PARAMS.publicMintPrice_.mul( qty ).add( 1 )
								}
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.mint( qty, tx_params )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE )
							})
						}
					})

					describe( CONTRACT.METHODS.mintAndStake.SIGNATURE, function () {
						if ( TEST.METHODS.mintAndStake ) {
							it( 'Trying to mint more tokens than allowed in one transaction should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_MAX_BATCH, async function () {
								const qty       = test_data.PARAMS.maxBatch_ + 1
								const qtyStaked = 1
								const tx_params = {
									value : test_data.PARAMS.publicMintPrice_.mul( qty )
								}
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintAndStake( qty, qtyStaked, tx_params )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_MAX_BATCH )
							})

							it( 'Trying to mint without paying enough should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE, async function () {
								const qty       = test_data.TOKEN_OWNER_SUPPLY
								const qtyStaked = 1
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintAndStake( qty, qtyStaked )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE )
							})

							it( 'Trying to mint by paying too much should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE, async function () {
								const qty       = test_data.TOKEN_OWNER_SUPPLY
								const qtyStaked = 1
								const tx_params = {
									value : test_data.PARAMS.publicMintPrice_.mul( qty ).add( 1 )
								}
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintAndStake( qty, qtyStaked, tx_params )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_INCORRECT_PRICE )
							})

							it( 'Trying to stake more tokens than minted should only stake the amount minted', async function () {
								const qty       = 1
								const qtyStaked = qty + 1
								const tx_params = {
									value : test_data.PARAMS.publicMintPrice_.mul( qty )
								}
								await expect(
									contract.connect( users[ TOKEN_OWNER ] )
													.mintAndStake( qty, qtyStaked, tx_params )
								).to.be.fulfilled
								const tokenOwner = users[ TOKEN_OWNER ].address
								expect(
									await contract.balanceOfStaked( tokenOwner )
								).to.equal( qty )
							})
						}
					})
				// **************************************

				// **************************************
				// *****       CONTRACT_OWNER       *****
				// **************************************
					describe( CONTRACT.METHODS.setAnonClaimList.SIGNATURE, function () {
						if ( TEST.METHODS.setAnonClaimList ) {
							it( 'Transaction initiated with sale state SALE should be reverted with ' + ERROR.IPausable_SALE_NOT_CLOSED, async function () {
								const accounts = [
									users[ TOKEN_OWNER ].address,
									users[ OTHER_OWNER ].address,
								]
								const amounts = [
									test_data.TOKEN_OWNER_SUPPLY,
									test_data.OTHER_OWNER_SUPPLY,
								]
								await shouldRevertWhenSaleStateIsNotClose(
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.setAnonClaimList( accounts, amounts )
								)
							})
						}
					})

					describe( CONTRACT.METHODS.setWhitelist.SIGNATURE, function () {
						if ( TEST.METHODS.setWhitelist ) {
							it( 'Transaction initiated with sale state SALE should be reverted with ' + ERROR.IPausable_SALE_NOT_CLOSED, async function () {
								const root = test_data.PASS_ROOT
								await shouldRevertWhenSaleStateIsNotClose(
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.setWhitelist( root )
								)
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeCCFoundersKeysAfterMint ( fixture, test_data ) {
		describe( 'Should behave like CCFoundersKeys after minting', function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_dev,
						test_safe,
						test_user1,
						test_user2,
						test_charity,
						test_contract,
						test_founders,
						test_community,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ 'DEV'             ] = test_dev
					users[ 'SAFE'            ] = test_safe
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ 'CHARITY'         ] = test_charity
					users[ 'FOUNDERS'        ] = test_founders
					users[ 'COMMUNITY'       ] = test_community
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer
				})

				// **************************************
				// *****            VIEW            *****
				// **************************************
					describe( CONTRACT.METHODS.balanceOfStaked.SIGNATURE, function () {
						if ( TEST.METHODS.balanceOfStaked ) {
							it( USER_NAMES[ TOKEN_OWNER ] + ' should have staked ' + test_data.TOKEN_OWNER_STAKED + ' tokens', async function () {
								const tokenOwner = users[ TOKEN_OWNER ].address
								expect(
									await contract.balanceOfStaked( tokenOwner )
								).to.equal( test_data.TOKEN_OWNER_STAKED )
							})

							it( USER_NAMES[ TOKEN_OWNER ] + ' should own ' + test_data.TOKEN_OWNER_SUPPLY + ' tokens', async function () {
								const tokenOwner = users[ TOKEN_OWNER ].address
								expect(
									await contract.balanceOf( tokenOwner )
								).to.equal( test_data.TOKEN_OWNER_SUPPLY )
							})

							it( USER_NAMES[ OTHER_OWNER ] + ' should have staked ' + test_data.OTHER_OWNER_STAKED + ' tokens', async function () {
								const tokenOwner = users[ OTHER_OWNER ].address
								expect(
									await contract.balanceOfStaked( tokenOwner )
								).to.equal( test_data.OTHER_OWNER_STAKED )
							})
						}
					})
				// **************************************

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.stake.SIGNATURE, function () {
						if ( TEST.METHODS.stake ) {
							it( USER_NAMES[ USER1 ] + ' trying to stake token number ' + test_data.TARGET_TOKEN + ' owned by ' + USER_NAMES[ TOKEN_OWNER ] + 'should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async function () {
								const tokenId = test_data.TARGET_TOKEN
								await shouldRevertWhenCallerIsNotApproved(
									contract.connect( users[ USER1 ] )
													.stake( tokenId )
								)
							})

							describe( USER_NAMES[ TOKEN_OWNER ] + ' stakes token number ' + test_data.TARGET_TOKEN, function () {
								beforeEach( async function () {
									const from    = users[ TOKEN_OWNER ].address
									const to      = contract.address
									const tokenId = test_data.TARGET_TOKEN
									await expect(
										contract.connect( users[ TOKEN_OWNER ] )
														.stake( tokenId )
									).to.emit( contract, CONTRACT.EVENTS.Transfer )
											.withArgs( from, to, tokenId )
								})

								// it( 'Contract should emit a ' + CONTRACT.EVENTS.Transfer + ' event mentioning that token number ' + test_data.TARGET_TOKEN + ' was transfered from ' + USER_NAMES[ TOKEN_OWNER ] + ' to the contract', async function () {
								// })

								it( USER_NAMES[ TOKEN_OWNER ] + ' should now have ' + ( test_data.TOKEN_OWNER_STAKED + 1 ).toString() + ' tokens staked', async function () {
									const tokenOwner = users[ TOKEN_OWNER ].address
									expect(
										await contract.balanceOfStaked( tokenOwner )
									).to.equal( test_data.TOKEN_OWNER_STAKED + 1 )
								})

								describe( CONTRACT.METHODS.unstake.SIGNATURE, function () {
									if ( TEST.METHODS.unstake ) {
										it( USER_NAMES[ USER1 ] + ' trying to unstake token number ' + test_data.TARGET_TOKEN + ' owned by ' + USER_NAMES[ TOKEN_OWNER ] + 'should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async function () {
											const tokenId = test_data.TARGET_TOKEN
											await shouldRevertWhenCallerIsNotApproved(
												contract.connect( users[ USER1 ] )
																.unstake( tokenId )
											)
										})

										it( 'Contract should emit a ' + CONTRACT.EVENTS.Transfer + ' event mentioning that token number ' + test_data.TARGET_TOKEN + ' was transfered from the contract to ' + USER_NAMES[ TOKEN_OWNER ], async function () {
											const from    = contract.address
											const to      = users[ TOKEN_OWNER ].address
											const tokenId = test_data.TARGET_TOKEN
											await expect(
												contract.connect( users[ TOKEN_OWNER ] )
																.unstake( tokenId )
											).to.emit( contract, CONTRACT.EVENTS.Transfer )
													.withArgs( from, to, tokenId )
										})
									}
								})
							})
						}
					})
				// **************************************

				// **************************************
				// *****       CONTRACT_OWNER       *****
				// **************************************
					describe( CONTRACT.METHODS.withdraw.SIGNATURE, function () {
						if ( TEST.METHODS.withdraw ) {
							it( 'Contract should emit a ' + CONTRACT.EVENTS.PaymentReleased + ' event mentioning the contract released payments to the club\'s wallets', async function () {
								await expect(
									contract.connect( users[ CONTRACT_DEPLOYER ] )
													.withdraw()
								).to.emit( contract, CONTRACT.EVENTS.PaymentReleased )
							})
						}
					})
				// **************************************
			}
		})
	}

	function shouldBehaveLikeCCFoundersKeysAfterMintingOutNotReserved ( fixture, test_data ) {
		describe( 'Should behave like CCFoundersKeys after minting out', function () {
			if ( TEST_ACTIVATION.CORRECT_INPUT ) {
				beforeEach( async function () {
					const {
						test_dev,
						test_safe,
						test_user1,
						test_user2,
						test_charity,
						test_contract,
						test_founders,
						test_community,
						test_proxy_user,
						test_token_owner,
						test_other_owner,
						test_proxy_contract,
						test_contract_deployer,
					} = await loadFixture( fixture )

					contract       = test_contract
					proxy_contract = test_proxy_contract
					users[ 'DEV'             ] = test_dev
					users[ 'SAFE'            ] = test_safe
					users[ USER1             ] = test_user1
					users[ USER2             ] = test_user2
					users[ 'CHARITY'         ] = test_charity
					users[ 'FOUNDERS'        ] = test_founders
					users[ 'COMMUNITY'       ] = test_community
					users[ PROXY_USER        ] = test_proxy_user
					users[ TOKEN_OWNER       ] = test_token_owner
					users[ OTHER_OWNER       ] = test_other_owner
					users[ CONTRACT_DEPLOYER ] = test_contract_deployer

					expect(
						await contract.totalSupply()
					).to.equal( test_data.MINT_OUT.MINT_QTY )

					expect(
						await contract.MAX_SUPPLY()
					).to.equal( test_data.MINT_OUT.PARAMS.maxSupply_ )
				})

				// **************************************
				// *****           PUBLIC           *****
				// **************************************
					describe( CONTRACT.METHODS.mint.SIGNATURE, function () {
						if ( TEST.METHODS.mint ) {
							it( 'Trying to mint tokens should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY, async function () {
								const qty       = 1
								const tx_params = {
									value : test_data.PARAMS.publicMintPrice_
								}
								await expect(
									contract.connect( users[ USER1 ] )
													.mint( qty, tx_params )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY )
							})
						}
					})

					describe( CONTRACT.METHODS.mintAndStake.SIGNATURE, function () {
						if ( TEST.METHODS.mintAndStake ) {
							it( 'Trying to mint tokens should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY, async function () {
								const qty       = 1
								const qtyStaked = 1
								const tx_params = {
									value : test_data.PARAMS.publicMintPrice_
								}
								await expect(
									contract.connect( users[ USER1 ] )
													.mintAndStake( qty, qtyStaked, tx_params )
								).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY )
							})
						}
					})

					describe( 'Reverting sale state to PRESALE', function () {
						beforeEach( async function () {
							const newState = CST.SALE_STATE.PRESALE
							await contract.connect( users[ CONTRACT_DEPLOYER ] )
														.setSaleState( newState )
						})

						describe( CONTRACT.METHODS.claim.SIGNATURE, function () {
							if ( TEST.METHODS.claim ) {
								it( 'Trying to claim tokens should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY, async function () {
									const qty = 1
									await expect(
										contract.connect( users[ TOKEN_OWNER ] )
														.claim( qty )
									).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY )
								})
							}
						})

						describe( CONTRACT.METHODS.claimAndStake.SIGNATURE, function () {
							if ( TEST.METHODS.claimAndStake ) {
								it( 'Trying to claim tokens should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY, async function () {
									const qty       = 1
									const qtyStaked = 1
									await expect(
										contract.connect( users[ TOKEN_OWNER ] )
														.claimAndStake( qty, qtyStaked )
									).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY )
								})
							}
						})

						describe( CONTRACT.METHODS.mintPreSale.SIGNATURE, function () {
							if ( TEST.METHODS.mintPreSale ) {
								it( 'Trying to mintPreSale tokens should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY, async function () {
									const passMax   = test_data.MINT_OUT.TOKEN_OWNER_WL
									const account   = users[ TOKEN_OWNER ].address
									const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
									const pass      = proof.pass
									const flag      = proof.flag
									const qty       = 1
									const tx_params = {
										value : test_data.PARAMS.wlMintPrice_.mul( qty )
									}
									await expect(
										contract.connect( users[ TOKEN_OWNER ] )
														.mintPreSale( qty, pass, flag, passMax, tx_params )
									).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY )
								})
							}
						})

						describe( CONTRACT.METHODS.mintPreSaleAndStake.SIGNATURE, function () {
							if ( TEST.METHODS.mintPreSaleAndStake ) {
								it( 'Trying to mintPreSale tokens should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY, async function () {
									const passMax   = test_data.MINT_OUT.TOKEN_OWNER_WL
									const account   = users[ TOKEN_OWNER ].address
									const proof     = generateProof( account, test_data.PASS_ROOT, passMax )
									const pass      = proof.pass
									const flag      = proof.flag
									const qty       = 1
									const qtyStaked = 1
									const tx_params = {
										value : test_data.PARAMS.wlMintPrice_.mul( qty )
									}
									await expect(
										contract.connect( users[ TOKEN_OWNER ] )
														.mintPreSaleAndStake( qty, pass, flag, passMax, qtyStaked, tx_params )
									).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_MAX_SUPPLY )
								})
							}
						})
					})
				// **************************************

				// **************************************
				// *****       CONTRACT_OWNER       *****
				// **************************************
					describe( CONTRACT.METHODS.airdrop.SIGNATURE, function () {
						if ( TEST.METHODS.airdrop ) {
							describe( 'Airdopping the remaining reserved tokens', function () {
								beforeEach( async function () {
									const accounts = [
										users[ USER1 ].address,
										users[ USER2 ].address,
									]
									const amounts  = [
										test_data.AIRDROP1,
										test_data.AIRDROP2,
									]
									await contract.connect( users[ CONTRACT_DEPLOYER ] )
																.airdrop( accounts, amounts )
								})

								it( 'Airdrop should be reverted with ' + CONTRACT.ERRORS.CCFoundersKeys_MAX_RESERVE, async function () {
									const accounts = [ users[ TOKEN_OWNER ].address, ]
									const amounts  = [ 1, ]
									await expect(
										contract.connect( users[ CONTRACT_DEPLOYER ] )
														.airdrop( accounts, amounts )
									).to.be.revertedWith( CONTRACT.ERRORS.CCFoundersKeys_MAX_RESERVE )
								})
							})
						}
					})
				// **************************************
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
		shouldBehaveLikeIOwnable( noMintFixture, TEST_DATA )
		shouldBehaveLikeIPausable( noMintFixture, TEST_DATA )
		shouldBehaveLikeERC721BaseBeforeMint( noMintFixture, TEST_DATA )
		shouldBehaveLikeERC721BaseEnumerableBeforeMint( noMintFixture, TEST_DATA )
		shouldBehaveLikeCCFoundersKeysAtDeploy( noMintFixture, TEST_DATA )
		shouldBehaveLikeCCFoundersKeysAfterSettingProxy( proxyFixture, TEST_DATA )
		shouldBehaveLikeCCFoundersKeysAfterSettingPreSale( presaleFixture, TEST_DATA )
		shouldBehaveLikeCCFoundersKeysAfterSettingAnonClaimList( anonClaimListFixture, TEST_DATA )
		shouldBehaveLikeCCFoundersKeysAfterSettingWhitelist( whitelistFixture, TEST_DATA )
		shouldBehaveLikeCCFoundersKeysAfterSettingSale( saleFixture, TEST_DATA )
		shouldBehaveLikeERC721BaseAfterMint( mintFixture, TEST_DATA )
		shouldBehaveLikeERC721BaseMetadata( mintFixture, TEST_DATA )
		shouldBehaveLikeERC721BaseEnumerableAfterMint( mintFixture, TEST_DATA )
		shouldBehaveLikeERC2981Base( mintFixture, TEST_DATA )
		shouldBehaveLikeERC721BatchStakable( mintAndStakeFixture, TEST_DATA )
		shouldBehaveLikeCCFoundersKeysAfterMint( mintAndStakeFixture, TEST_DATA )
		shouldBehaveLikeCCFoundersKeysAfterMintingOutNotReserved( mintOutFixture, TEST_DATA )
	}
})
