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

let contract
let users = {}

function generateProof ( address, root, qty ) {
	const bnroot = ethers.BigNumber.from( root ).sub( ethers.BigNumber.from( qty ) )
	const bnaddr = ethers.BigNumber.from( ethers.utils.keccak256( address ) )
	const temp = bnroot.sub( bnaddr )
	const flag = temp.gt( CST.NUMBER_ZERO ) ? false : true
	const pass = temp.gt( CST.NUMBER_ZERO ) ? temp : bnaddr.sub( bnroot )

	return { pass: pass, flag: flag }
}

async function shouldRevertWhenWitelistIsNotSet ( promise ) {
	await expect( promise ).to.be.revertedWith( ERROR.IWhitelistable_NOT_SET )
} 

async function shouldRevertWhenWhitelistIsConsumed ( promise ) {
	await expect( promise ).to.be.revertedWith( ERROR.IWhitelistable_CONSUMED )
}

async function shouldRevertWhenNotWhitelisted ( promise ) {
	await expect( promise ).to.be.revertedWith( ERROR.IWhitelistable_FORBIDDEN )
}

module.exports = {
	generateProof,
	shouldRevertWhenWitelistIsNotSet,
	shouldRevertWhenWhitelistIsConsumed,
	shouldRevertWhenNotWhitelisted,
}
