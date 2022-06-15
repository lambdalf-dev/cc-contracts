const fs = require( 'fs' )
const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )
chai.use( chaiAsPromised )
const expect = chai.expect

const { ethers, waffle } = require( 'hardhat' )
const CONTRACT_ADDRESS = '0xdBFf8Fb7C608CadEE9b3e5a247b3Eb35b5F50e67'
const ABI = [{"inputs":[{"internalType":"uint256","name":"reserve_","type":"uint256"},{"internalType":"uint256","name":"maxBatch_","type":"uint256"},{"internalType":"uint256","name":"maxSupply_","type":"uint256"},{"internalType":"uint256","name":"royaltyRate_","type":"uint256"},{"internalType":"uint256","name":"wlMintPrice_","type":"uint256"},{"internalType":"uint256","name":"publicMintPrice_","type":"uint256"},{"internalType":"string","name":"name_","type":"string"},{"internalType":"string","name":"symbol_","type":"string"},{"internalType":"string","name":"baseURI_","type":"string"},{"internalType":"address[]","name":"wallets_","type":"address[]"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"CCFoundersKeys_ARRAY_LENGTH_MISMATCH","type":"error"},{"inputs":[],"name":"CCFoundersKeys_FORBIDDEN","type":"error"},{"inputs":[],"name":"CCFoundersKeys_INCORRECT_PRICE","type":"error"},{"inputs":[],"name":"CCFoundersKeys_INSUFFICIENT_KEY_BALANCE","type":"error"},{"inputs":[],"name":"CCFoundersKeys_MAX_BATCH","type":"error"},{"inputs":[],"name":"CCFoundersKeys_MAX_RESERVE","type":"error"},{"inputs":[],"name":"CCFoundersKeys_MAX_SUPPLY","type":"error"},{"inputs":[],"name":"CCFoundersKeys_NO_ETHER_BALANCE","type":"error"},{"inputs":[],"name":"CCFoundersKeys_TRANSFER_FAIL","type":"error"},{"inputs":[],"name":"IERC2981_INVALID_ROYALTIES","type":"error"},{"inputs":[],"name":"IERC721Enumerable_INDEX_OUT_OF_BOUNDS","type":"error"},{"inputs":[],"name":"IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS","type":"error"},{"inputs":[],"name":"IERC721_APPROVE_CALLER","type":"error"},{"inputs":[],"name":"IERC721_APPROVE_OWNER","type":"error"},{"inputs":[],"name":"IERC721_CALLER_NOT_APPROVED","type":"error"},{"inputs":[],"name":"IERC721_NONEXISTANT_TOKEN","type":"error"},{"inputs":[],"name":"IERC721_NON_ERC721_RECEIVER","type":"error"},{"inputs":[],"name":"IERC721_NULL_ADDRESS_BALANCE","type":"error"},{"inputs":[],"name":"IERC721_NULL_ADDRESS_TRANSFER","type":"error"},{"inputs":[],"name":"IOwnable_NOT_OWNER","type":"error"},{"inputs":[],"name":"IPausable_PRESALE_NOT_OPEN","type":"error"},{"inputs":[],"name":"IPausable_SALE_NOT_CLOSED","type":"error"},{"inputs":[],"name":"IPausable_SALE_NOT_OPEN","type":"error"},{"inputs":[],"name":"IWhitelistable_CONSUMED","type":"error"},{"inputs":[],"name":"IWhitelistable_FORBIDDEN","type":"error"},{"inputs":[],"name":"IWhitelistable_NOT_SET","type":"error"},{"inputs":[],"name":"IWhitelistable_NO_ALLOWANCE","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address[]","name":"tos","type":"address[]"},{"indexed":true,"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"name":"PaymentReleased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"enum IPausable.SaleState","name":"previousState","type":"uint8"},{"indexed":true,"internalType":"enum IPausable.SaleState","name":"newState","type":"uint8"}],"name":"SaleStateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"MAX_BATCH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_SUPPLY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PUBLIC_MINT_PRICE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WL_MINT_PRICE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts_","type":"address[]"},{"internalType":"uint256[]","name":"amounts_","type":"uint256[]"}],"name":"airdrop","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"anonClaimList","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to_","type":"address"},{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner_","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner_","type":"address"}],"name":"balanceOfStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"qty_","type":"uint256"}],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"qty_","type":"uint256"},{"internalType":"uint256","name":"qtyStaked_","type":"uint256"}],"name":"claimAndStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner_","type":"address"},{"internalType":"address","name":"operator_","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"qty_","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"qty_","type":"uint256"},{"internalType":"uint256","name":"qtyStaked_","type":"uint256"}],"name":"mintAndStake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"proof_","type":"bytes32[]"}],"name":"mintPreSale","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"proof_","type":"bytes32[]"}],"name":"mintPreSaleAndStake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes","name":"","type":"bytes"}],"name":"onERC721Received","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"ownerOfStaked","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"},{"internalType":"uint256","name":"salePrice_","type":"uint256"}],"name":"royaltyInfo","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"to_","type":"address"},{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"to_","type":"address"},{"internalType":"uint256","name":"tokenId_","type":"uint256"},{"internalType":"bytes","name":"data_","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"saleState","outputs":[{"internalType":"enum IPausable.SaleState","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts_","type":"address[]"},{"internalType":"uint256[]","name":"amounts_","type":"uint256[]"}],"name":"setAnonClaimList","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator_","type":"address"},{"internalType":"bool","name":"approved_","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"proxyRegistryAddress_","type":"address"}],"name":"setProxyRegistry","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"royaltyRecipient_","type":"address"},{"internalType":"uint256","name":"royaltyRate_","type":"uint256"}],"name":"setRoyaltyInfo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"enum IPausable.SaleState","name":"newState_","type":"uint8"}],"name":"setSaleState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"root_","type":"bytes32"}],"name":"setWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId_","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index_","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner_","type":"address"},{"internalType":"uint256","name":"index_","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"to_","type":"address"},{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner_","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const BLOCK_NUMBER = 14636415
const TOTAL_SUPPLY = 1018
const BATCH_SIZE   = 100

describe( 'Snapshot Keys', function () {
	let holders = {}
	let contract
	let signer
	let addrs

	beforeEach( async function () {
		[ signer, ...addrs ] = await ethers.getSigners()
		contract = new ethers.Contract( CONTRACT_ADDRESS, ABI, signer )
	})

	it( `Block number should be ${ BLOCK_NUMBER }`, async function () {
		expect(
			await ethers.provider.getBlockNumber()
		).to.equal( BLOCK_NUMBER )
	})

	it( `Total supply should be ${ TOTAL_SUPPLY }`, async function () {
		expect(
			await contract.totalSupply()
		).to.equal( TOTAL_SUPPLY )
	})

	it( `Snapshotting holders 0 - ${ BATCH_SIZE } ...`, async function () {
		for ( let i = 0; i < BATCH_SIZE; i++ ) {
			const tokenOwner = await contract.ownerOf( i )
			if ( holders[ tokenOwner ] ) {
				holders[ tokenOwner ] += 1
			}
			else {
				holders[ tokenOwner ] = 1
			}
		}
	})

	it( `Snapshotting holders ${ BATCH_SIZE } - ${ BATCH_SIZE * 2 } ...`, async function () {
		for ( let i = BATCH_SIZE; i < BATCH_SIZE * 2; i++ ) {
			const tokenOwner = await contract.ownerOf( i )
			if ( holders[ tokenOwner ] ) {
				holders[ tokenOwner ] += 1
			}
			else {
				holders[ tokenOwner ] = 1
			}
		}
	})

	it( `Snapshotting holders ${ BATCH_SIZE * 2 } - ${ BATCH_SIZE * 4 } ...`, async function () {
		for ( let i = BATCH_SIZE * 2; i < BATCH_SIZE * 4; i++ ) {
			const tokenOwner = await contract.ownerOf( i )
			if ( holders[ tokenOwner ] ) {
				holders[ tokenOwner ] += 1
			}
			else {
				holders[ tokenOwner ] = 1
			}
		}
	})

	it( `Snapshotting holders ${ BATCH_SIZE * 4 } - ${ BATCH_SIZE * 5 } ...`, async function () {
		for ( let i = BATCH_SIZE * 4; i < BATCH_SIZE * 5; i++ ) {
			const tokenOwner = await contract.ownerOf( i )
			if ( holders[ tokenOwner ] ) {
				holders[ tokenOwner ] += 1
			}
			else {
				holders[ tokenOwner ] = 1
			}
		}
	})

	it( `Snapshotting holders ${ BATCH_SIZE * 5 } - ${ BATCH_SIZE * 6 } ...`, async function () {
		for ( let i = BATCH_SIZE * 5; i < BATCH_SIZE * 6; i++ ) {
			const tokenOwner = await contract.ownerOf( i )
			if ( holders[ tokenOwner ] ) {
				holders[ tokenOwner ] += 1
			}
			else {
				holders[ tokenOwner ] = 1
			}
		}
	})

	it( `Snapshotting holders ${ BATCH_SIZE * 6 } - ${ BATCH_SIZE * 7 } ...`, async function () {
		for ( let i = BATCH_SIZE * 6; i < BATCH_SIZE * 7; i++ ) {
			const tokenOwner = await contract.ownerOf( i )
			if ( holders[ tokenOwner ] ) {
				holders[ tokenOwner ] += 1
			}
			else {
				holders[ tokenOwner ] = 1
			}
		}
	})

	it( `Snapshotting holders ${ BATCH_SIZE * 7 } - ${ BATCH_SIZE * 8 } ...`, async function () {
		for ( let i = BATCH_SIZE * 7; i < BATCH_SIZE * 8; i++ ) {
			const tokenOwner = await contract.ownerOf( i )
			if ( holders[ tokenOwner ] ) {
				holders[ tokenOwner ] += 1
			}
			else {
				holders[ tokenOwner ] = 1
			}
		}
	})

	it( `Snapshotting holders ${ BATCH_SIZE * 8 } - ${ BATCH_SIZE * 9 } ...`, async function () {
		for ( let i = BATCH_SIZE * 8; i < BATCH_SIZE * 9; i++ ) {
			const tokenOwner = await contract.ownerOf( i )
			if ( holders[ tokenOwner ] ) {
				holders[ tokenOwner ] += 1
			}
			else {
				holders[ tokenOwner ] = 1
			}
		}
	})

	it( `Snapshotting holders ${ BATCH_SIZE * 9 } - ${ BATCH_SIZE * 10 } ...`, async function () {
		for ( let i = BATCH_SIZE * 9; i < BATCH_SIZE * 10; i++ ) {
			const tokenOwner = await contract.ownerOf( i )
			if ( holders[ tokenOwner ] ) {
				holders[ tokenOwner ] += 1
			}
			else {
				holders[ tokenOwner ] = 1
			}
		}
	})

	it( `Snapshotting holders ${ BATCH_SIZE * 10 } - ${ TOTAL_SUPPLY } ...`, async function () {
		for ( let i = BATCH_SIZE * 10; i < TOTAL_SUPPLY; i++ ) {
			const tokenOwner = await contract.ownerOf( i )
			if ( holders[ tokenOwner ] ) {
				holders[ tokenOwner ] += 1
			}
			else {
				holders[ tokenOwner ] = 1
			}
		}
	})

	after( async function () {
		console.debug( `saving snapshot` )
		if ( typeof holders !== 'undefined' ) {
			for ( const prop in holders ) {
				console.debug( `${ prop },${ holders[ prop ] }` )
				fs.appendFile( 'snapshot.csv', prop + ',' + holders[ prop ] + '\n', function( err ) {
					if ( err ) {
						return console.debug( err )
					}
				})
			}
		}
		else {
			console.debug( 'snapshot failed' )
			return
		}
		console.debug( 'snapshot saved...' )
	})
})
